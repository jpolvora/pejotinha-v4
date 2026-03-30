import { Metadata } from 'next'
import { getSanitizedSettings } from '@/actions/settings'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = {
  title: 'Configurações | Pejotinha',
  description: 'Gerencie suas configurações e integrações de sistema',
}

export default async function SettingsPage() {
  const settings = await getSanitizedSettings()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
          <p className="text-muted-foreground">
            Ajuste as preferências da sua conta e integrações externas.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <SettingsForm initialData={settings} />
      </div>
    </div>
  )
}
