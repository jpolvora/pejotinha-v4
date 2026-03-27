
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Azure DevOps Webhook
 * Handles git.push, git.pullrequest and pipeline events.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType = body.eventType;
    const resource = body.resource;

    // 1. Basic Validation (Shared Secret if set in env)
    const secret = req.headers.get("x-pj-webhook-secret");
    const allowedSecret = process.env.WEBHOOK_SECRET;
    
    if (allowedSecret && secret !== allowedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract Branch Tracking (if available in resource)
    // Azure DevOps git.push events have refUpdates
    const ref = resource?.refUpdates?.[0]?.name || resource?.sourceRefName;
    const branch = ref ? ref.replace("refs/heads/", "") : null;

    // 3. Extract Repository / Project Name
    const repoName = resource?.repository?.name?.toLowerCase();
    
    // Attempt Mapping Strategy:
    // a. Check branch for client/slug or project/slug
    // b. Use repo name as project slug
    let project = null;

    if (branch) {
      const branchRegex = /^(?:client|project)\/([^\/]+)\//i;
      const match = branch.match(branchRegex);
      if (match) {
          const slug = match[1].toLowerCase();
          const isClientSlug = branch.toLowerCase().startsWith("client/");
          
          if (isClientSlug) {
              project = await prisma.project.findFirst({
                  where: { customer: { slug }, status: 'active' },
                  orderBy: { createdAt: 'desc' }
              });
          } else {
              project = await prisma.project.findUnique({ where: { slug } });
          }
      }
    }

    // fallback to repo name
    if (!project && repoName) {
        project = await prisma.project.findFirst({
            where: {
              OR: [
                { slug: repoName },
                { name: { contains: repoName, mode: 'insensitive' } }
              ]
            }
        });
    }

    if (!project) {
        return NextResponse.json({ 
            success: true, 
            message: `Event received but no project mapped for repo: ${repoName || 'N/A'}` 
        });
    }

    // 4. Record Evidence
    let evidenceContent = `[Azure ${eventType}] `;
    if (eventType === 'git.push') {
        const commitCount = resource.commits?.length || 0;
        const msg = resource.commits?.[0]?.comment || "";
        evidenceContent += `${commitCount} commits by ${resource.pushedBy?.displayName}. Latest: ${msg}`;
    } else if (eventType.includes('pullrequest')) {
        evidenceContent += `PR: ${resource.title} (${resource.status})`;
    } else {
        evidenceContent += `Event recorded from ${repoName}`;
    }

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
          startTime: new Date()
        }
      });
    }

    await prisma.evidence.create({
      data: {
        activityId: activity.id,
        evidenceType: 'text',
        content: evidenceContent
      }
    });

    return NextResponse.json({ success: true, project: project.name });

  } catch (error: any) {
    console.error("Azure Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
