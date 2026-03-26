"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProjects(customerId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const whereClause: any = {
    freelancerId: user.id
  };
  
  if (customerId) {
    whereClause.customerId = customerId;
  }

  const projects = await prisma.project.findMany({
    where: whereClause,
    include: {
      customer: { select: { name: true } },
      activities: { select: { durationMinutes: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  return projects.map((p: any) => ({
    ...p,
    customers: p.customer, // compatibility with older UI payload mapping
    totalHours: p.activities.reduce((acc: number, act: any) => acc + (act.durationMinutes / 60), 0)
  }));
}

export async function getProjectById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true } },
      activities: { select: { durationMinutes: true } }
    }
  });

  if (!project || (project.freelancerId !== user.id && project.clientProfileId !== user.id)) {
    return null;
  }

  return {
    ...project,
    customers: project.customer,
    totalHours: project.activities.reduce((acc: number, act: any) => acc + (act.durationMinutes / 60), 0)
  };
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const customerId = formData.get("customer_id") as string;
  const description = formData.get("description") as string | null;
  const hourly_rate = parseFloat(formData.get("hourly_rate") as string) || 0;
  const slug = formData.get("slug") as string | null;
  const tech_stacks_str = formData.get("tech_stacks") as string | null;
  const tech_stacks = tech_stacks_str ? tech_stacks_str.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!name || !customerId) throw new Error("Name and Customer are required");

  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.freelancerId !== user.id) throw new Error("Unauthorized customer");

  await prisma.project.create({
    data: {
      freelancerId: user.id,
      customerId,
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description,
      hourly_rate,
      tech_stacks
    }
  });

  revalidatePath("/projects");
}

export async function updateProject(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const hourly_rate = parseFloat(formData.get("hourly_rate") as string) || 0;
  const slug = formData.get("slug") as string | null;
  const tech_stacks_str = formData.get("tech_stacks") as string | null;
  const tech_stacks = tech_stacks_str ? tech_stacks_str.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (!name) throw new Error("Name is required");

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized");

  const updated = await prisma.project.update({
    where: { id },
    data: { 
      name, 
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      description, 
      hourly_rate, 
      tech_stacks 
    }
  });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized");

  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
}
