import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { ProfileForm } from './profile-form'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Meu Perfil | Pejotinha',
  description: 'Gerencie suas informações pessoais e segurança da conta',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id }
  })

  // Determine the login provider
  const provider = user.app_metadata.provider || 'email'

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais, altere sua senha ou encerre sua conta.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <ProfileForm 
          initialData={{
            email: user.email!,
            fullName: profile?.fullName || '',
            provider: provider,
            role: profile?.role || 'freelancer',
            createdAt: profile?.createdAt || new Date(),
          }} 
        />
      </div>
    </div>
  )
}
