"use server";

import prisma from "@/lib/prisma";
import { actionWrapper } from "@/lib/action-utils";
import { startOfDay, endOfDay } from "date-fns";

export type TimelineFilterOptions = {
  projectId?: string;
  startDate?: string;
  endDate?: string;
  visibility?: "all" | "public" | "private";
};

export async function getFilteredTimeline(options: TimelineFilterOptions) {
  return await actionWrapper(async (user) => {
    const { projectId, startDate, endDate, visibility = "all" } = options;

    const whereActivity: any = {
      project: {
        freelancerId: user.id,
      },
    };

    const whereEvent: any = {
      freelancerId: user.id,
    };

    // Filter by Project
    if (projectId) {
      whereActivity.projectId = projectId;
      // Events aren't linked to projects, but if specific project filtered, 
      // we might want to hide personal events or keep them. 
      // User requested "dropbox project", usually implies work focus.
    }

    // Filter by Date Range
    if (startDate || endDate) {
      const start = startDate ? startOfDay(new Date(startDate)) : undefined;
      const end = endDate ? endOfDay(new Date(endDate)) : undefined;

      if (start || end) {
        whereActivity.startTime = {};
        whereEvent.startTime = {};
        
        if (start) {
          whereActivity.startTime.gte = start;
          whereEvent.startTime.gte = start;
        }
        if (end) {
          whereActivity.startTime.lte = end;
          whereEvent.startTime.lte = end;
        }
      }
    }

    // Filter by Visibility
    if (visibility === "public") {
      whereActivity.isPrivate = false;
      // Personal events are always private, so if visibility is public, we hide them.
    } else if (visibility === "private") {
      whereActivity.isPrivate = true;
    }

    // Fetch Activities
    const activities = await prisma.activity.findMany({
      where: whereActivity,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            slug: true,
            customer: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: { evidences: true }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    // Fetch Personal Events
    let events: any[] = [];
    if (visibility !== "public" && !projectId) { // If filtering by project, we hide personal events
       events = await prisma.personalEvent.findMany({
        where: whereEvent,
        orderBy: { startTime: 'desc' }
      });
    }

    // Map and Merge
    const merged = [
      ...activities.map(a => ({
        id: a.id,
        type: 'activity',
        title: a.description,
        description: a.summary || '',
        startTime: a.startTime,
        endTime: a.endTime,
        durationMinutes: a.durationMinutes,
        isPrivate: a.isPrivate,
        projectId: a.project.id,
        projectSlug: a.project.slug,
        projectName: a.project.name,
        customerName: a.project.customer.name,
        evidenceCount: a._count.evidences,
        status: a.status,
        source: a.source
      })),
      ...events.map(e => ({
        id: e.id,
        type: 'personal',
        title: e.title,
        description: e.description || '',
        startTime: e.startTime,
        endTime: e.endTime,
        durationMinutes: 0, // Should calc if needed
        isPrivate: true,
        projectSlug: null,
        projectName: null,
        evidenceCount: e.proofUrl ? 1 : 0,
        status: 'approved',
        source: 'personal'
      }))
    ].sort((a, b) => {
      const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return dateB - dateA;
    });

    return merged;
  });
}
