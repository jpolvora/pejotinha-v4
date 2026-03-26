'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createExpense(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const description = formData.get('description') as string
  const amount = parseFloat(formData.get('amount') as string)
  const category = formData.get('category') as string
  const date = formData.get('date') as string
  const projectId = formData.get('project_id') as string | null // Ensure projectId can be string or null

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
  // Return void to keep Next.js 15 form action happy in all contexts
}

export async function deleteExpense(expenseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Security: Check ownership
  const expenseCheck = await prisma.expense.findUnique({
    where: { id: expenseId }
  })
  if (!expenseCheck || expenseCheck.freelancerId !== user.id) throw new Error('Unauthorized expense access')

  const expense = await prisma.expense.delete({
    where: { id: expenseId }
  })
  revalidatePath('/expenses')
  return expense
}

export async function getFreelancerExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return await prisma.expense.findMany({
    where: { freelancerId: user.id },
    orderBy: { date: 'desc' },
    include: {
      project: {
        select: { name: true }
      }
    }
  })
}
