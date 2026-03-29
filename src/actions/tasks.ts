'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionWrapper, ActionResponse } from "@/lib/action-utils"
import { task_status } from "@prisma/client"

export async function createBatchTasks(projectId: string, tasks: { name: string, description?: string, dueDate?: string }[]): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    // Security: Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized project access");

    // Get max position to append
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: 'pending' },
      orderBy: { position: 'desc' } as any
    });
    let nextPos = (lastTask as any)?.position !== undefined ? (lastTask as any).position + 1 : 0;

    const newTasks = await prisma.task.createMany({
      data: tasks.map((t, idx) => ({
        projectId,
        name: t.name,
        description: t.description,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        status: 'pending' as task_status,
        position: nextPos + idx
      } as any))
    })
    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/taskboard')
    return newTasks
  })
}

export async function createTask(formData: FormData): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const projectId = formData.get('project_id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const dueDate = formData.get('due_date') as string
    const status = (formData.get('status') || 'pending') as task_status

    // Security: Check project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || project.freelancerId !== user.id) throw new Error("Unauthorized project access");

    // Get max position for this status
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status },
      orderBy: { position: 'desc' } as any
    });
    const position = (lastTask as any)?.position !== undefined ? (lastTask as any).position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        projectId,
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        status,
        position
      } as any
    })

    revalidatePath(`/projects/${projectId}`)
    revalidatePath('/taskboard')
    return task
  })
}

export async function updateTaskStatus(taskId: string, status: task_status): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const taskCheck = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });
    if (!taskCheck || (taskCheck as any).project.freelancerId !== user.id) throw new Error("Unauthorized task access");

    // When moving to a new status without explicit position, append to end
    const lastTask = await prisma.task.findFirst({
      where: { projectId: taskCheck.projectId, status },
      orderBy: { position: 'desc' } as any
    });
    const position = (lastTask as any)?.position !== undefined ? (lastTask as any).position + 1 : 0;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status, position } as any
    })
    revalidatePath(`/projects/${task.projectId}`)
    revalidatePath('/taskboard')
    return task
  })
}

export async function updateTaskPosition(taskId: string, status: task_status, position: number): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const taskCheck = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });
    if (!taskCheck || (taskCheck as any).project.freelancerId !== user.id) throw new Error("Unauthorized task access");

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status, position } as any
    })
    
    revalidatePath(`/projects/${task.projectId}`)
    revalidatePath('/taskboard')
    return task
  })
}

export async function deleteTask(taskId: string): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const taskCheck = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });
    if (!taskCheck || (taskCheck as any).project.freelancerId !== user.id) throw new Error("Unauthorized task access");

    const task = await prisma.task.delete({
      where: { id: taskId }
    })
    revalidatePath(`/projects/${task.projectId}`)
    revalidatePath('/taskboard')
    return task
  })
}

export async function getProjectTasks(projectId: string): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });
    if (!project || (project.freelancerId !== user.id && project.clientProfileId !== user.id)) {
      return [];
    }

    return await prisma.task.findMany({
      where: { projectId },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' }
      ] as any
    })
  })
  return result.success ? result.data! : []
}

export async function getAllTasks(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.task.findMany({
      where: { 
        project: { freelancerId: user.id }
      },
      include: {
        project: {
          select: { name: true, slug: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { position: 'asc' }
      ] as any
    })
  })
  return result.success ? result.data! : []
}
