"use server";

import prisma from "@/lib/prisma";
import { actionWrapper } from "@/lib/action-utils";

export async function getBillingData(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    const projects = await prisma.project.findMany({
      where: { freelancerId: user.id },
      include: {
        customer: true,
        activities: {
          include: { approvals: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(p => {
      // Apenas considera faturamento de horas aprovadas
      const pActivities = p.activities.filter(a => 
        a.approvals.some(app => app.status === "approved")
      );
      
      const totalMinutes = pActivities.reduce((acc, curr) => acc + curr.durationMinutes, 0);
      const totalHours = totalMinutes / 60;
      const totalAmount = totalHours * Number(p.hourly_rate);

      return {
        ...p,
        customers: p.customer,
        totalHours,
        totalAmount,
        approvedActivitiesCount: pActivities.length
      };
    });
  });

  return result.success ? result.data! : [];
}
