"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { summarizeWorkEvents } from "./ai";

export async function getActivities(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Security: Ensure the project belongs to the user or client profile
  const activities = await prisma.activity.findMany({
    where: {
      projectId: projectId,
      project: {
        OR: [
          { freelancerId: user.id },
          { clientProfileId: user.id }
        ]
      }
    },
    include: {
      evidences: true,
      approvals: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return activities;
}

export async function createActivity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  
  const projectId = formData.get("project_id") as string;
  const description = formData.get("description") as string;
  const executionPlan = formData.get("execution_plan") as string | null;
  const sprint = formData.get("sprint") as string | null;
  const ticket = formData.get("ticket") as string | null;
  const startTimeRaw = formData.get("start_time") as string | null;
  const endTimeRaw = formData.get("end_time") as string | null;
  
  if (!projectId || !description) throw new Error("Project ID and Description required");

  // Validate ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { hourly_rate: true, freelancerId: true }
  });
  
  if (!project || project.freelancerId !== user.id) {
    throw new Error("Unauthorized or project not found");
  }

  let durationMinutes = parseInt(formData.get("duration_minutes") as string || "0", 10);
  let startTime = startTimeRaw ? new Date(startTimeRaw) : null;
  let endTime = endTimeRaw ? new Date(endTimeRaw) : null;

  // Calculo Avançado em Tempo Real
  if (startTime && endTime) {
    durationMinutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
  } else if (!startTime && !endTime && durationMinutes > 0) {
    // Retroactive mapping for legacy or simple inputs
    endTime = new Date();
    startTime = new Date(endTime.getTime() - durationMinutes * 60000);
  }

  const hourlyRate = Number(project.hourly_rate) || 0;
  const value = (durationMinutes / 60) * hourlyRate;

  const activity = await prisma.activity.create({
    data: {
      projectId,
      description,
      executionPlan,
      durationMinutes,
      value,
      sprint,
      ticket,
      startTime,
      endTime
    }
  });

  // Handle Evidences Loop
  const evidenceCount = parseInt(formData.get("evidence_count") as string || "0", 10);
  if (evidenceCount > 0) {
    for (let i = 0; i < evidenceCount; i++) {
        const type = formData.get(`evidence_type_${i}`) as string;
        
        if (type === 'file') {
            const file = formData.get(`evidence_file_${i}`) as File;
            if (file && file.size > 0) {
                const fileExt = file.name.split('.').pop() || 'tmp';
                const filePath = `${activity.id}/evidence_${Date.now()}_${i}.${fileExt}`;
                
                const { error: uploadError } = await supabase.storage
                  .from("evidence-storage")
                  .upload(filePath, file);

                if (!uploadError) {
                  const { data: { publicUrl } } = supabase.storage
                    .from("evidence-storage")
                    .getPublicUrl(filePath);
                  
                  await prisma.evidence.create({
                    data: {
                      activityId: activity.id,
                      evidenceType: 'file',
                      fileUrl: publicUrl
                    }
                  });
                } else {
                  console.error("Storage upload error for evidence:", uploadError);
                }
            }
        } else if (type === 'link' || type === 'text') {
            const content = formData.get(`evidence_content_${i}`) as string;
            if (content) {
                 await prisma.evidence.create({
                    data: {
                      activityId: activity.id,
                      evidenceType: type,
                      content
                    }
                  });
            }
        }
    }
  }

  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function deleteActivity(id: string, projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validate ownership
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { project: true }
  });

  if (!activity || activity.project.freelancerId !== user.id) {
    throw new Error("Unauthorized");
  }

  await prisma.activity.delete({ where: { id } });
  revalidatePath(`/projects/${projectId}`);
}

export async function uploadEvidence(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  const activityId = formData.get("activity_id") as string;
  const projectId = formData.get("project_id") as string;

  if (!file || !activityId) throw new Error("File and activity ID are required");

  // Validate
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { project: true }
  });
  if (!activity || activity.project.freelancerId !== user.id) {
    throw new Error("Unauthorized");
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${activityId}/${Date.now()}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from("evidence-storage")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Supabase Storage Upload Error:", uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("evidence-storage")
    .getPublicUrl(filePath);

  await prisma.evidence.create({
    data: {
      activityId,
      fileUrl: publicUrl
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function approveActivity(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activityId = formData.get("activity_id") as string;
  const projectId = formData.get("project_id") as string;
  const status = formData.get("status") as any; // 'approved' | 'rejected' | 'revision'
  const feedback = formData.get("feedback") as string | null;

  // Validate the client profile matching
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { project: true }
  });
  
  if (!activity || activity.project.clientProfileId !== user.id) {
    throw new Error("Unauthorized to approve this project activities");
  }

  await prisma.approval.create({
    data: {
      activityId,
      clientId: user.id,
      status,
      feedback
    }
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function generateProjectSummary(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Gather all activities and evidences of today for this project
  const activities = await prisma.activity.findMany({
    where: {
      projectId,
      createdAt: { gte: today },
      project: { freelancerId: user.id }
    },
    include: {
      evidences: true
    }
  });

  if (activities.length === 0) return { success: false, message: "No activities found for today." };

  // 2. Prepare raw events list
  const events: string[] = [];
  activities.forEach(act => {
    events.push(act.description);
    act.evidences.forEach(ev => {
      if (ev.content) events.push(ev.content);
    });
  });

  // 3. Call AI summarized
  const result = await summarizeWorkEvents(events);
  if (!result.success) return result;

  // 4. Update the "Daily Dev Log" activity with the summary
  const dailyLog = activities.find(a => a.description.includes("[Auto] Daily Dev Log")) || activities[0];

  await prisma.activity.update({
    where: { id: dailyLog.id },
    data: { summary: result.summary }
  });

  revalidatePath(`/projects/${projectId}`);
  return { success: true, summary: result.summary };
}
