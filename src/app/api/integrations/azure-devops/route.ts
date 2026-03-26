import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  // Support token via Authorization header or query parameter
  const token = req.nextUrl.searchParams.get('token') || authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { webhookSecret: token },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { eventType, message, resource, createdDate, id: eventId } = body

    // Try to find a slug from the project/repo name in ADO payload
    // or from a query parameter
    const adProjName = resource?.project?.name || resource?.repository?.name
    const slug = req.nextUrl.searchParams.get('slug') || adProjName?.toLowerCase().replace(/\s+/g, '-')

    if (!slug) {
      return NextResponse.json({ error: 'Could not determine project slug' }, { status: 400 })
    }

    const project = await prisma.project.findFirst({
      where: {
        slug: slug,
        freelancerId: profile.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: `Project with slug '${slug}' not found` }, { status: 404 })
    }

    // Check for duplicate event
    const existingActivity = await prisma.activity.findFirst({
      where: {
        externalId: eventId,
        projectId: project.id,
        source: 'azure-devops'
      }
    })

    if (existingActivity) {
      return NextResponse.json({ success: true, message: 'Event already logged', activityId: existingActivity.id })
    }

    const activity = await prisma.activity.create({
      data: {
        projectId: project.id,
        description: message?.text || `Azure DevOps Event: ${eventType}`,
        startTime: new Date(createdDate || Date.now()),
        endTime: new Date(createdDate || Date.now()),
        durationMinutes: 0,
        source: 'azure-devops',
        externalId: eventId,
        evidences: {
          create: {
            evidenceType: 'azure_devops_event',
            content: JSON.stringify(resource, null, 2),
          }
        }
      }
    })

    return NextResponse.json({ success: true, activityId: activity.id })
  } catch (error: any) {
    console.error('Azure DevOps integration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
