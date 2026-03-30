'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from '@/i18n/routing'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const locale = await getLocale()
  revalidatePath('/', 'layout')
  redirect({ href: '/login', locale })
}
