"use server";

import prisma from "@/lib/prisma";
import { actionWrapper } from "@/lib/action-utils";

export async function getReportsData(): Promise<any> {
  const result = await actionWrapper(async (user) => {
    const projects = await prisma.project.findMany({
      where: { freelancerId: user.id },
      include: { activities: true, customer: true }
    });

    const timePerProject = projects.map(p => ({
      name: p.name,
      customer: p.customer.name,
      totalMinutes: p.activities.reduce((acc, a) => acc + a.durationMinutes, 0),
      amount: (p.activities.reduce((acc, a) => acc + a.durationMinutes, 0) / 60) * Number(p.hourly_rate)
    }));

    const timePerProjectChart = timePerProject.map(p => ({
      name: p.name,
      totalHours: parseFloat((p.totalMinutes / 60).toFixed(2))
    })).filter(p => p.totalHours > 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = await prisma.activity.findMany({
      where: {
        project: { freelancerId: user.id },
        startTime: { gte: thirtyDaysAgo }
      },
      select: { startTime: true, durationMinutes: true }
    });

    const dailyDataMap: Record<string, number> = {};
    recentActivities.forEach(act => {
      if (act.startTime) {
        const dateStr = new Date(act.startTime).toISOString().split('T')[0];
        dailyDataMap[dateStr] = (dailyDataMap[dateStr] || 0) + act.durationMinutes;
      }
    });

    const dailyChartData = Object.keys(dailyDataMap)
      .sort()
      .map(date => ({
        date,
        hours: parseFloat((dailyDataMap[date] / 60).toFixed(2))
      }));

    return { timePerProjectChart, timePerProject, dailyChartData };
  });

  return result.success ? result.data! : null;
}

export async function getDetailedProjectReport(projectId?: string, startDate?: string, endDate?: string): Promise<any> {
  const result = await actionWrapper(async (user) => {
    const whereClause: any = {
      project: {
          OR: [
              { freelancerId: user.id },
              { clientProfileId: user.id }
          ]
      }
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) whereClause.startTime.gte = new Date(startDate);
      if (endDate) {
          const d = new Date(endDate);
          d.setHours(23, 59, 59, 999);
          whereClause.startTime.lte = d;
      }
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        project: {
          include: { customer: true }
        },
        approvals: {
          include: { client: { select: { fullName: true, email: true } } }
        },
        evidences: true
      },
      orderBy: { startTime: 'desc' }
    });

    const summary = activities.reduce((acc, a) => {
      const min = a.durationMinutes || 0;
      acc.totalMinutes += min;
      acc.totalValue += Number(a.value) || 0;
      return acc;
    }, { totalMinutes: 0, totalValue: 0 });

    return { activities, summary };
  });

  return result.success ? result.data! : { activities: [], summary: { totalMinutes: 0, totalValue: 0 } };
}
