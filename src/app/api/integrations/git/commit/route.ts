import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = authHeader.replace('Bearer ', '')
  const profile = await prisma.profile.findUnique({
    where: { webhookSecret: secret },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { hash, message, branch, client_slug, files_changed, timestamp } = body

    if (!client_slug) {
      return NextResponse.json({ error: 'client_slug is required' }, { status: 400 })
    }

    // Find project by slug and freelancerId
    const project = await prisma.project.findFirst({
      where: {
        slug: client_slug,
        freelancerId: profile.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: `Project with slug '${client_slug}' not found` }, { status: 404 })
    }

    // Check for duplicate commit
    const existingActivity = await prisma.activity.findFirst({
      where: {
        externalId: hash,
        projectId: project.id,
        source: 'git'
      }
    })

    if (existingActivity) {
      return NextResponse.json({ success: true, message: 'Commit already logged', activityId: existingActivity.id })
    }

    // Create Activity
    const activity = await prisma.activity.create({
      data: {
        projectId: project.id,
        description: message,
        startTime: new Date(timestamp),
        endTime: new Date(timestamp),
        durationMinutes: 0,
        source: 'git',
        externalId: hash,
        evidences: {
          create: {
            evidenceType: 'git_commit',
            content: `Branch: ${branch}\nFiles: ${files_changed}`,
          }
        }
      }
    })

    return NextResponse.json({ success: true, activityId: activity.id })
  } catch (error: any) {
    console.error('Git integration error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
