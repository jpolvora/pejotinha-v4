
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Git Post-Commit Webhook
 * Expected body: { apiKey, branch, commitHash, message, author }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, branch, commitHash, message, author } = body;

    if (!apiKey || !branch) {
      return NextResponse.json({ error: "apiKey and branch are required" }, { status: 400 });
    }

    // 1. Authenticate Freelancer
    const freelancer = await prisma.profile.findUnique({
      where: { apiKey },
      select: { id: true, fullName: true }
    });

    if (!freelancer) {
      return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }

    // 2. Extract Slug from Branch (client/<slug>/... or project/<slug>/...)
    const branchRegex = /^(?:client|project)\/([^\/]+)\//i;
    const match = branch.match(branchRegex);

    if (!match) {
      return NextResponse.json({ 
        success: true, 
        message: "Branch doesn't match naming convention. No mapping done." 
      });
    }

    const slug = match[1].toLowerCase();
    const isClientSlug = branch.toLowerCase().startsWith("client/");

    // 3. Find Target Project
    let project;
    if (isClientSlug) {
      // Find latest active project for this customer
      project = await prisma.project.findFirst({
        where: {
          freelancerId: freelancer.id,
          customer: { slug },
          status: 'active'
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Find project by slug directly
      project = await prisma.project.findFirst({
        where: {
          freelancerId: freelancer.id,
          slug: slug
        }
      });
    }

    if (!project) {
      return NextResponse.json({ 
        success: true, 
        message: `No project found for slug: ${slug}. Check your slug configuration.` 
      });
    }

    // 4. Find or Create Daily Activity for this project
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activity = await prisma.activity.findFirst({
      where: {
        projectId: project.id,
        description: { startsWith: "[Auto] Daily Dev Log" },
        createdAt: { gte: today }
      }
    });

    if (!activity) {
      activity = await prisma.activity.create({
        data: {
          projectId: project.id,
          description: `[Auto] Daily Dev Log - ${new Date().toLocaleDateString('pt-BR')}`,
          durationMinutes: 0, // Will be updated by user later or kept as is
          startTime: new Date()
        }
      });
    }

    // 5. Add Evidence
    const evidenceContent = `Commit by ${author || freelancer.fullName}: ${message} (${commitHash?.substring(0, 7) || 'N/A'})`;
    
    await prisma.evidence.create({
      data: {
        activityId: activity.id,
        evidenceType: 'text',
        content: evidenceContent
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Mapped to project: ${project.name}`,
      activityId: activity.id 
    });

  } catch (error: any) {
    console.error("Git Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
