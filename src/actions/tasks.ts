'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionWrapper, ActionResponse } from "@/lib/action-utils"

export type task_status = 'pending' | 'doing' | 'done'

export async function createBatchTasks(projectId: string, tasks: { name: string, description?: string, dueDate?: string }[]): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
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
  })
}

export async function createTask(formData: FormData): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
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
  })
}

export async function updateTaskStatus(taskId: string, status: task_status): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
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
  })
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
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
  })
}

export async function getProjectTasks(projectId: string): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    // Security: Check project ownership or access
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
  })
  return result.success ? result.data! : []
}
