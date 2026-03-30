import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Handle Auth Callback for Google / OAuth
 * Automates profile synchronization
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // 🚀 Auto-Registration Logic: Ensure Profile exists in Prisma
      try {
        const profile = await prisma.profile.findUnique({
          where: { id: user.id }
        })

        if (!profile) {
          await prisma.profile.create({
            data: {
              id: user.id,
              email: user.email!,
              fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
            }
          })
        }
      } catch (prismaError) {
        console.error('Failed to sync profile during OAuth:', prismaError)
        // We continue anyway as the auth session is valid, 
        // but it might cause issues later if the profile is missing.
      }

      return NextResponse.redirect(new URL(redirectTo, origin))
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}
