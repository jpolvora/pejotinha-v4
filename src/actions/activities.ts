"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { summarizeWorkEvents } from "./ai";
import { actionWrapper, ActionResponse } from "@/lib/action-utils";


export async function getActivities(projectId: string): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.activity.findMany({
      where: {
        projectId: projectId,
        project: {
          OR: [
            { freelancerId: user.id },
            { clientProfileId: user.id },
            { projectAccess: { some: { profileId: user.id } } }
          ]
        }
      },
      include: {
        evidences: true,
        approvals: true,
        task: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  });
  return result.success ? result.data! : [];
}

export async function createActivity(formData: FormData): Promise<any> {
  const result = await actionWrapper(async (user, supabase) => {
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

    if (startTime && endTime) {
      durationMinutes = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 60000));
    } else if (!startTime && !endTime && durationMinutes > 0) {
      endTime = new Date();
      startTime = new Date(endTime.getTime() - durationMinutes * 60000);
    }

    const hourlyRate = Number(project.hourly_rate) || 0;
    const value = (durationMinutes / 60) * hourlyRate;
    const isPaid = formData.get("is_paid") === "true";
    const paidAt = isPaid ? new Date() : null;

    const taskIdString = formData.get("task_id") as string;
    const taskId = taskIdString && taskIdString.trim() !== "" ? taskIdString : null;

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
        endTime,
        isPaid,
        paidAt,
        taskId,
        isPrivate: formData.get("is_private") === "true"
      } as any
    });

    // Handle Evidences Loop
    const evidenceCount = parseInt(formData.get("evidence_count") as string || "0", 10);
    if (evidenceCount > 0) {
      for (let i = 0; i < evidenceCount; i++) {
          const type = formData.get(`evidence_type_${i}`) as string;
          
          if (type === 'file') {
              const file = formData.get(`evidence_file_${i}`) as File;
              if (file && file.size > 0) {
                  // Detect Evidence Type based on MIME
                  let evidenceType = 'file';
                  if (file.type.startsWith('image/')) {
                    evidenceType = file.type.includes('gif') ? 'gif' : 'image';
                  } else if (file.type.startsWith('video/')) {
                    evidenceType = 'video';
                  }

                  const fileExt = file.name.split('.').pop() || 'tmp';
                  const filePath = `${activity.id}/evidence_${Date.now()}_${i}.${fileExt}`;
                  
                  const { error: uploadError } = await supabase.storage
                    .from("evidence-storage")
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                  if (uploadError) {
                      console.error(`[Storage Error] Failed to upload ${file.name}:`, uploadError.message);
                      continue; 
                  }

                  const { data: { publicUrl } } = supabase.storage
                    .from("evidence-storage")
                    .getPublicUrl(filePath);
                  
                  await prisma.evidence.create({
                    data: {
                      activityId: activity.id,
                      evidenceType: evidenceType,
                      fileUrl: publicUrl
                    }
                  });
              }
          } else if (type === 'link' || type === 'text' || type === 'commit') {
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
    return { id: activity.id, projectId };
  });

  if (result.success && result.data) {
    redirect(`/projects/${result.data.projectId}`);
  }
  return result;
}

export async function deleteActivity(id: string, projectId: string): Promise<any> {
  return await actionWrapper(async (user) => {
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!activity || activity.project.freelancerId !== user.id) {
      throw new Error("Unauthorized");
    }

    await prisma.activity.delete({ where: { id } });
    revalidatePath(`/projects/${projectId}`);
  });
}

export async function uploadEvidence(formData: FormData): Promise<ActionResponse> {
  return await actionWrapper(async (user, supabase) => {
    const file = formData.get("file") as File;
    const activityId = formData.get("activity_id") as string;
    const projectId = formData.get("project_id") as string;

    if (!file || !activityId) throw new Error("File and activity ID are required");

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { project: true }
    });
    if (!activity || activity.project.freelancerId !== user.id) {
      throw new Error("Unauthorized");
    }

    // Detect Evidence Type base on MIME
    let evidenceType = 'file';
    if (file.type.startsWith('image/')) {
      evidenceType = file.type.includes('gif') ? 'gif' : 'image';
    } else if (file.type.startsWith('video/')) {
      evidenceType = 'video';
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${activityId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("evidence-storage")
      .upload(filePath, file);

    if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from("evidence-storage")
      .getPublicUrl(filePath);

    await prisma.evidence.create({
      data: {
        activityId,
        evidenceType: evidenceType,
        fileUrl: publicUrl
      }
    });

    revalidatePath(`/projects/${projectId}`);
  });
}

export async function approveActivity(formData: FormData): Promise<any> {
  return await actionWrapper(async (user) => {
    const activityId = formData.get("activity_id") as string;
    const projectId = formData.get("project_id") as string;
    const status = formData.get("status") as string; 
    const feedback = formData.get("feedback") as string | null;

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { 
        project: {
          include: {
            projectAccess: {
              where: { profileId: user.id }
            }
          }
        } 
      }
    });
    
    const hasAccess = activity?.project.clientProfileId === user.id || 
                    (activity?.project.projectAccess[0]?.role === 'owner');

    if (!activity || !hasAccess) {
      throw new Error("Unauthorized access for approval");
    }

    const finalActivityStatus = 
      status === 'approved' ? 'approved' : 
      status === 'rejected' ? 'rejected' : 
      status === 'revision' ? 'pending_evidence' : 
      'pending';

    await prisma.$transaction([
      prisma.approval.create({
        data: {
          activityId,
          clientId: user.id,
          status: status === 'revision' ? 'revision' : (status as any),
          feedback
        }
      }),
      prisma.activity.update({
        where: { id: activityId },
        data: { status: finalActivityStatus as any }
      })
    ]);

    revalidatePath(`/projects/${projectId}`);
  });
}

export async function updateActivity(id: string, formData: FormData): Promise<any> {
  return await actionWrapper(async (user) => {
    const description = formData.get("description") as string;
    const status = formData.get("status") as any;
    const isPaid = formData.get("is_paid") === "true";
    const projectId = formData.get("project_id") as string;

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!activity || activity.project.freelancerId !== user.id) {
      throw new Error("Unauthorized");
    }

    const paidAt = isPaid && !activity.isPaid ? new Date() : (isPaid ? activity.paidAt : null);

    const isPrivate = formData.get("is_private") === "true";

    await prisma.activity.update({
      where: { id },
      data: { 
        description, 
        status, 
        isPaid, 
        paidAt,
        isPrivate
      } as any
    });

    revalidatePath(`/projects/${projectId}`);
  });
}

export async function addEvidence(activityId: string, projectId: string, formData: FormData): Promise<ActionResponse> {
  return await actionWrapper(async (user, supabase) => {
    const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { project: true }
    });

    if (!activity || activity.project.freelancerId !== user.id) {
        throw new Error("Unauthorized");
    }

    const type = formData.get("type") as string; 
    
    if (type === 'file') {
        const file = formData.get("file") as File;
        if (!file || file.size === 0) throw new Error("File required");
        
        // Detect Evidence Type base on MIME
        let evidenceType = 'file';
        if (file.type.startsWith('image/')) {
          evidenceType = file.type.includes('gif') ? 'gif' : 'image';
        } else if (file.type.startsWith('video/')) {
          evidenceType = 'video';
        }

        const fileExt = file.name.split('.').pop();
        const filePath = `${activityId}/evidence_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from("evidence-storage")
            .upload(filePath, file);

        if (uploadError) throw new Error(`Upload error: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
            .from("evidence-storage")
            .getPublicUrl(filePath);
        
        await prisma.evidence.create({
            data: {
                activityId,
                evidenceType: evidenceType,
                fileUrl: publicUrl
            }
        });
    } else {
        const content = formData.get("content") as string;
        if (!content) throw new Error("Content required");
        
        await prisma.evidence.create({
            data: {
                activityId,
                evidenceType: type,
                content
            }
        });
    }

    revalidatePath(`/projects/${projectId}`);
  });
}

export async function deleteEvidence(id: string, activityId: string, projectId: string): Promise<ActionResponse> {
  return await actionWrapper(async (user, supabase) => {
    const evidence = await prisma.evidence.findUnique({
        where: { id },
        include: { activity: { include: { project: true } } }
    });

    if (!evidence || evidence.activity.project.freelancerId !== user.id) {
        throw new Error("Unauthorized");
    }

    if (evidence.evidenceType === 'file' && evidence.fileUrl) {
       try {
           const url = new URL(evidence.fileUrl);
           const path = url.pathname.split('/evidence-storage/')[1];
           if (path) {
               await supabase.storage.from("evidence-storage").remove([path]);
           }
       } catch (e) {
           console.error("Failed to delete from storage:", e);
       }
    }

    await prisma.evidence.delete({ where: { id } });
    revalidatePath(`/projects/${projectId}`);
  });
}

export async function generateProjectSummary(projectId: string): Promise<any> {
  return await actionWrapper(async (user) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await prisma.activity.findMany({
      where: {
        projectId,
        createdAt: { gte: today },
        project: { freelancerId: user.id }
      },
      include: { evidences: true }
    });

    if (activities.length === 0) throw new Error("No activities found for today.");

    const events: string[] = [];
    activities.forEach(act => {
      events.push(act.description);
      act.evidences.forEach(ev => {
        if (ev.content) events.push(ev.content);
      });
    });

    const result = await summarizeWorkEvents(events);
    if (!result.success) throw new Error(result.error || "AI summarization failed");

    const dailyLog = activities.find(a => a.description.includes("[Auto] Daily Dev Log")) || activities[0];

    await prisma.activity.update({
      where: { id: dailyLog.id },
      data: { summary: result.summary }
    });

    revalidatePath(`/projects/${projectId}`);
    return { summary: result.summary };
  });
}
