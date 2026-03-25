"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getBillingData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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

  const billingData = projects.map(p => {
    // Apenas considera faturamento de horas aprovadas
    const pActivities = p.activities.filter(a => 
      a.approvals.some(app => app.status === "approved")
    );
    
    const totalMinutes = pActivities.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const totalHours = totalMinutes / 60;
    const totalAmount = totalHours * Number(p.hourly_rate);

    return {
      ...p,
      customers: p.customer, // Backwards compatible mapping
      totalHours,
      totalAmount,
      approvedActivitiesCount: pActivities.length
    };
  });

  return billingData;
}
