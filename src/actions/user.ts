'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { actionWrapper, ActionResponse } from "@/lib/action-utils"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from 'next/navigation'

/**
 * Updates the user's profile information.
 */
export async function updateProfile(fullName: string): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    await prisma.profile.update({
      where: { id: user.id },
      data: { fullName }
    })

    revalidatePath('/profile')
    return { success: true, message: "Perfil atualizado com sucesso!" }
  })
}

/**
 * Updates the user's password.
 */
export async function updatePassword(password: string): Promise<ActionResponse> {
  return await actionWrapper(async (user, supabase) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      throw error
    }

    return { success: true, message: "Senha alterada com sucesso!" }
  })
}

/**
 * Deletes the user's account and all related data.
 * This is a destructive action.
 */
export async function deleteAccount() {
  const result = await actionWrapper(async (user) => {
    const userId = user.id

    // 1. Delete user from Prisma (cascading deletes for projects, customers, etc.)
    await prisma.profile.delete({
      where: { id: userId }
    })

    // 2. Delete user from Supabase Auth using admin client
    const admin = createAdminClient()
    const { error: authError } = await admin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Auth Deletion Error:", authError)
      // Even if admin.deleteUser fails, the Prisma records are gone.
      // In a real SaaS, maybe you'd revert or log this carefully.
    }

    return { success: true }
  })

  if (result.success) {
    redirect('/login')
  }

  return result
}
