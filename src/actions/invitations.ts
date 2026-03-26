"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { client_access_role } from "@prisma/client";

export async function createInvitation(projectId: string, email: string, role: client_access_role = "owner") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { freelancer: true }
  });

  if (!project || project.freelancerId !== user.id) {
    throw new Error("Projeto não encontrado ou você não tem permissão");
  }

  // Check if user already exists
  const existingUser = await prisma.profile.findUnique({
    where: { email }
  });

  if (existingUser) {
    // Relate them to the project with ProjectAccess
    await prisma.projectAccess.upsert({
      where: {
        projectId_profileId: {
          projectId,
          profileId: existingUser.id
        }
      },
      update: { role },
      create: {
        projectId,
        profileId: existingUser.id,
        role
      }
    });

    // Backward compatibility: update clientProfileId if it's currently null
    if (!project.clientProfileId) {
      await prisma.project.update({
        where: { id: projectId },
        data: { clientProfileId: existingUser.id }
      });
    }
    
    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: `O usuário ${email} foi associado ao projeto com nível ${role}.` };
  }

  // Create an invitation token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  await prisma.invitation.create({
    data: {
      email,
      projectId,
      freelancerId: user.id,
      token,
      expiresAt,
      status: "pending",
      role
    }
  });

  // In a real app, send email here. For now, we return the URL or just log it.
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`;
  
  console.log(`[INVITATION] Sent to ${email}: ${inviteUrl}`);

  revalidatePath(`/projects/${projectId}`);
  return { success: true, inviteUrl, message: `Convite enviado para ${email} (${role}).` };
}

export async function acceptInvitation(token: string) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    // Redirect to login or signup with the token in query?
    redirect(`/login?invite_token=${token}`);
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { project: true }
  });

  if (!invitation || invitation.status !== "pending") {
    throw new Error("Convite inválido ou já utilizado.");
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "expired" }
    });
    throw new Error("Este convite expirou.");
  }

  // Check if current user is the target or if matches email?
  // If invitation email matches current user email or if it's open
  // User says "relate them to the project"
  
  await prisma.$transaction([
    prisma.projectAccess.upsert({
      where: {
        projectId_profileId: {
          projectId: invitation.projectId,
          profileId: authUser.id
        }
      },
      update: { role: invitation.role },
      create: {
        projectId: invitation.projectId,
        profileId: authUser.id,
        role: invitation.role
      }
    }),
    prisma.project.update({
      where: { id: invitation.projectId },
      data: { clientProfileId: authUser.id } // Still update main client for now
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" }
    }),
    prisma.profile.update({
      where: { id: authUser.id },
      data: { role: "client" }
    })
  ]);

  revalidatePath("/dashboard");
  redirect(`/projects/${invitation.projectId}`);
}

export async function getInvitations(projectId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return prisma.invitation.findMany({
        where: { 
            projectId,
            freelancerId: user.id
        },
        orderBy: { createdAt: 'desc' }
    });
}
