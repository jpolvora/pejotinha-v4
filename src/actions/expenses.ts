'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionWrapper, ActionResponse } from "@/lib/action-utils"

export async function createExpense(formData: FormData): Promise<any> {
  return await actionWrapper(async (user) => {
    const description = formData.get('description') as string
    const amount = parseFloat(formData.get('amount') as string)
    const category = formData.get('category') as string
    const date = formData.get('date') as string
    const projectId = formData.get('project_id') as string | null

    const expense = await prisma.expense.create({
      data: {
        freelancerId: user.id,
        description,
        amount,
        category,
        date: date ? new Date(date) : new Date(),
        projectId: projectId || null
      }
    })

    revalidatePath('/expenses')
    if (projectId) revalidatePath(`/projects/${projectId}`)
    return expense
  })
}

export async function deleteExpense(expenseId: string): Promise<any> {
  return await actionWrapper(async (user) => {
    // Security: Check ownership
    const expenseCheck = await prisma.expense.findUnique({
      where: { id: expenseId }
    })
    
    if (!expenseCheck || expenseCheck.freelancerId !== user.id) {
      throw new Error('Unauthorized expense access')
    }

    await prisma.expense.delete({
      where: { id: expenseId }
    })
    
    revalidatePath('/expenses')
  })
}

export async function getFreelancerExpenses(): Promise<any[]> {
  const result = await actionWrapper(async (user) => {
    return await prisma.expense.findMany({
      where: { freelancerId: user.id },
      orderBy: { date: 'desc' },
      include: {
        project: {
          select: { name: true }
        }
      }
    })
  })
  return result.success ? result.data! : []
}
