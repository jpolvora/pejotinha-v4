'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { redirect } from "next/navigation";

// Use strings instead of explicit enum import if it's causing issues
export type task_status = 'pending' | 'doing' | 'done'

export async function createBatchTasks(projectId: string, tasks: { name: string, description?: string, dueDate?: string }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Security: Check project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized project access");

  const newTasks = await prisma.task.createMany({
    data: tasks.map(t => ({
      projectId,
      name: t.name,
      description: t.description,
      dueDate: t.dueDate ? new Date(t.dueDate) : null,
      status: 'pending' as task_status
    }))
  })
  revalidatePath(`/projects/${projectId}`)
  return newTasks
}

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const projectId = formData.get('project_id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const dueDate = formData.get('due_date') as string
  const status = formData.get('status') as task_status

  // Security: Check project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized project access");

  const task = await prisma.task.create({
    data: {
      projectId,
      name,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'pending'
    }
  })

  revalidatePath(`/projects/${projectId}`)
  return task
}

export async function updateTaskStatus(taskId: string, status: task_status) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Security: Check ownership via project
  const taskCheck = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });
  if (!taskCheck || taskCheck.project.freelancerId !== user.id) throw new Error("Unauthorized task access");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status }
  })
  revalidatePath(`/projects/${task.projectId}`)
  return task
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Security: Check ownership via project
  const taskCheck = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });
  if (!taskCheck || taskCheck.project.freelancerId !== user.id) throw new Error("Unauthorized task access");

  const task = await prisma.task.delete({
    where: { id: taskId }
  })
  revalidatePath(`/projects/${task.projectId}`)
  return task
}

export async function getProjectTasks(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Security: Check project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project || (project.freelancerId !== user.id && project.clientProfileId !== user.id)) {
    return [];
  }

  return await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' }
  })
}
