'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { success: false, message: error.message }
  }

  const locale = await getLocale()
  revalidatePath('/dashboard', 'layout')
  redirect({ href: '/dashboard', locale })
}

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { success: false, message: error.message }
  }

  if (data.user && data.session) {
    const locale = await getLocale()
    revalidatePath('/dashboard', 'layout')
    redirect({ href: '/dashboard', locale })
  }

  return { 
    success: true, 
    message: 'Check your email to confirm your account!' 
  }
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  
  // Use 'x-forwarded-host' or 'host' for reliability, but default to localhost
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  const origin = `${protocol}://${host}`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, message: error.message }
  }

  if (data.url) {
    // Note: external URL redirect, safe to use native redirect
    const { redirect: nativeRedirect } = await import('next/navigation')
    nativeRedirect(data.url)
  }

  return { success: false, message: 'Failed to get OAuth URL' }
}
