"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { actionWrapper, ActionResponse } from "@/lib/action-utils";
import { createClient } from "@/lib/supabase/server";

export async function getPersonalEvents(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.personalEvent.findMany({
      where: { freelancerId: user.id },
      orderBy: { startTime: 'desc' }
    });
  });
  return result.success ? result.data! : [];
}

export async function createPersonalEvent(formData: FormData): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const startTimeRaw = formData.get("start_time") as string;
    const endTimeRaw = formData.get("end_time") as string;

    if (!title || !startTimeRaw || !endTimeRaw) {
      throw new Error("Title, Start Time, and End Time are required");
    }

    const proofFile = formData.get("proof_file") as File | null;

    let event = await prisma.personalEvent.create({
      data: {
        freelancerId: user.id,
        title,
        description,
        startTime: new Date(startTimeRaw),
        endTime: new Date(endTimeRaw),
      }
    });

    // Upload proof if attached
    if (proofFile && proofFile.size > 0) {
      const fileExt = proofFile.name.split('.').pop() || 'tmp';
      const filePath = `agenda/${event.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("evidence-storage")
        .upload(filePath, proofFile);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from("evidence-storage")
          .getPublicUrl(filePath);
        
        event = await prisma.personalEvent.update({
          where: { id: event.id },
          data: { proofUrl: publicUrl }
        });
      }
    }

    revalidatePath("/calendar");
    return event;
  });
}

export async function deletePersonalEvent(id: string): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const ev = await prisma.personalEvent.findUnique({ where: { id } });
    if (!ev || ev.freelancerId !== user.id) throw new Error("Unauthorized access to event");

    await prisma.personalEvent.delete({ where: { id } });
    revalidatePath("/calendar");
  });
}
