"use server";

import prisma from "@/lib/prisma";
import { actionWrapper } from "@/lib/action-utils";

interface DashboardStats {
  totalMinutes: number;
  totalHoursStr: string;
  activeProjects: number;
  activeClients: number;
  pendingApprovals: number;
  evidencesUploaded: number;
  weeklyChartData: { date: string; durationMinutes: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const result = await actionWrapper(async (user) => {
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    if (!profile) return null;

    const isFreelancer = profile.role === 'freelancer';

    const activeProjectsCount = await prisma.project.count({
      where: isFreelancer
        ? { freelancerId: user.id, status: 'active' }
        : { clientProfileId: user.id, status: 'active' },
    });

    const activeClientsCount = isFreelancer
      ? await prisma.customer.count({ where: { freelancerId: user.id } })
      : 0;

    const activities = await prisma.activity.findMany({
      where: isFreelancer
        ? { project: { freelancerId: user.id } }
        : { project: { clientProfileId: user.id } },
      select: { id: true, durationMinutes: true, startTime: true },
    });

    const totalMinutes = activities.reduce((sum, act) => sum + act.durationMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    const activityIds = activities.map(a => a.id);

    const evidencesCount = activityIds.length > 0 ? await prisma.evidence.count({
      where: { activityId: { in: activityIds } },
    }) : 0;

    const pendingApprovalsCount = activityIds.length > 0 ? await prisma.approval.count({
      where: { activityId: { in: activityIds }, status: "revision" },
    }) : 0;

    // Weekly chart data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentActivities = activities.filter(
      (a) => a.startTime && new Date(a.startTime) >= sevenDaysAgo
    );

    const dailyMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }

    recentActivities.forEach((act) => {
      if (act.startTime) {
        const dateKey = new Date(act.startTime).toISOString().split('T')[0];
        dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + act.durationMinutes);
      }
    });

    const weeklyChartData = Array.from(dailyMap.entries()).map(([date, durationMinutes]) => ({
      date,
      durationMinutes,
    }));

    return {
      totalMinutes,
      totalHoursStr: `${totalHours}h ${totalMins}m`,
      activeProjects: activeProjectsCount,
      activeClients: activeClientsCount,
      pendingApprovals: pendingApprovalsCount,
      evidencesUploaded: evidencesCount,
      weeklyChartData,
    };
  });

  return result.success ? result.data! : null;
}

export async function getIntegratedTimeline(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    const isFreelancer = profile?.role === 'freelancer';

    const activities = await prisma.activity.findMany({
      where: isFreelancer
        ? { project: { freelancerId: user.id } }
        : { project: { clientProfileId: user.id } },
      include: { 
        project: { select: { name: true, slug: true, freelancerId: true } },
        evidences: { select: { evidenceType: true } }
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    const timelineItems: any[] = activities.map(act => ({
      type: 'activity',
      id: act.id,
      title: act.description,
      description: `Projeto: ${act.project.name}`,
      startTime: act.startTime,
      endTime: act.endTime,
      durationMinutes: act.durationMinutes,
      source: act.source,
      projectSlug: act.project.slug,
      evidenceCount: act.evidences.length,
    }));

    if (isFreelancer) {
      const personalEvents = await prisma.personalEvent.findMany({
        where: { freelancerId: user.id },
        orderBy: { startTime: 'desc' },
        take: 50,
      });

      timelineItems.push(...personalEvents.map(pe => ({
        type: 'personal',
        id: pe.id,
        title: pe.title,
        description: pe.description,
        startTime: pe.startTime,
        endTime: pe.endTime,
        proofUrl: pe.proofUrl,
      })));
    } else {
      const projects = await prisma.project.findMany({
        where: { clientProfileId: user.id },
        select: { freelancerId: true },
      });
      const freelancerIds = [...new Set(projects.map(p => p.freelancerId))];

      if (freelancerIds.length > 0) {
        const events = await prisma.personalEvent.findMany({
          where: { freelancerId: { in: freelancerIds } },
          orderBy: { startTime: 'desc' },
          take: 50,
        });

        timelineItems.push(...events.map(pe => ({
          type: 'personal_anonymous',
          id: pe.id,
          title: "Busy Time / Pause",
          description: "Freelancer is handling personal or private commitments.",
          startTime: pe.startTime,
          endTime: pe.endTime,
          proofUrl: null,
        })));
      }
    }

    return timelineItems.sort((a, b) => {
      const timeA = new Date(a.startTime || 0).getTime();
      const timeB = new Date(b.startTime || 0).getTime();
      return timeB - timeA;
    }).slice(0, 50);
  });

  return result.success ? result.data! : [];
}
