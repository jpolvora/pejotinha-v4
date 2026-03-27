"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { client_access_role } from "@prisma/client";
import { actionWrapper, ActionResponse } from "@/lib/action-utils";
import { createClient } from "@/lib/supabase/server";

export async function createInvitation(projectId: string, email: string, role: client_access_role = "owner"): Promise<any> {
  return await actionWrapper(async (user) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.freelancerId !== user.id) {
      throw new Error("Projeto não encontrado ou você não tem permissão");
    }

    const existingUser = await prisma.profile.findUnique({
      where: { email }
    });

    if (existingUser) {
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

      if (!project.clientProfileId) {
        await prisma.project.update({
          where: { id: projectId },
          data: { clientProfileId: existingUser.id }
        });
      }
      
      revalidatePath(`/projects/${projectId}`);
      return { success: true, message: `O usuário ${email} foi associado ao projeto com nível ${role}.` };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

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

    revalidatePath(`/projects/${projectId}`);
    return { 
      success: true, 
      token, // Return token for UI to show or use
      message: `Convite enviado para ${email} (${role}).` 
    };
  });
}

export async function acceptInvitation(token: string): Promise<any> {
  const result = await actionWrapper(async (user) => {
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
    
    await prisma.$transaction([
      prisma.projectAccess.upsert({
        where: {
          projectId_profileId: {
            projectId: invitation.projectId,
            profileId: user.id
          }
        },
        update: { role: invitation.role },
        create: {
          projectId: invitation.projectId,
          profileId: user.id,
          role: invitation.role
        }
      }),
      prisma.project.update({
        where: { id: invitation.projectId },
        data: { clientProfileId: user.id }
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" }
      }),
      prisma.profile.update({
        where: { id: user.id },
        data: { role: "client" }
      })
    ]);

    revalidatePath("/dashboard");
    return { projectId: invitation.projectId };
  }); 

  if (!result.success) {
    if (result.error === "Unauthorized") {
        redirect(`/login?invite_token=${token}`);
    }
    return result;
  }

  const data = result.data as { projectId: string };
  redirect(`/projects/${data.projectId}`);
}

export async function getInvitations(projectId: string): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.invitation.findMany({
      where: { 
        projectId,
        freelancerId: user.id
      },
      orderBy: { createdAt: 'desc' }
    });
  });
  return result.success ? result.data! : [];
}
