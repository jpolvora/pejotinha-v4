"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getPersonalEvents() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const events = await prisma.personalEvent.findMany({
    where: { freelancerId: user.id },
    orderBy: { startTime: 'desc' }
  });

  return events;
}

export async function createPersonalEvent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string | null;
  const startTimeRaw = formData.get("start_time") as string;
  const endTimeRaw = formData.get("end_time") as string;

  if (!title || !startTimeRaw || !endTimeRaw) throw new Error("Title, Start Time, and End Time are required");

  let proofUrl: string | null = null;
  const proofFile = formData.get("proof_file") as File | null;

  const event = await prisma.personalEvent.create({
    data: {
      freelancerId: user.id,
      title,
      description,
      startTime: new Date(startTimeRaw),
      endTime: new Date(endTimeRaw),
      proofUrl
    }
  });

  // Upload proof se anexado
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
      
      await prisma.personalEvent.update({
        where: { id: event.id },
        data: { proofUrl: publicUrl }
      });
    } else {
      console.error("Erro no upload da prova:", uploadError);
    }
  }

  revalidatePath("/calendar");
  return event;
}

export async function deletePersonalEvent(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const ev = await prisma.personalEvent.findUnique({ where: { id } });
  if (!ev || ev.freelancerId !== user.id) throw new Error("Unauthorized");

  await prisma.personalEvent.delete({ where: { id } });
  revalidatePath("/calendar");
}
