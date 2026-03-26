'use server'

import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { encrypt, decrypt } from '@/lib/encryption'
import crypto from 'crypto'

export interface SaveSettingsInput {
  aiConfig: {
    provider: string
    apiKey: string
    baseUrl: string
    model: string
  }
  telegramConfig?: {
    botToken: string
    chatId: string
  }
  webhookSecret?: string
  defaultHourlyRate?: number
}

/**
 * Internal function to get settings with raw (decrypted) secrets.
 * Use this only in Server Actions that need to call external APIs.
 */
export async function getSettings() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { settings: true, webhookSecret: true, defaultHourlyRate: true }
  })

  const settings = profile?.settings as unknown as SaveSettingsInput | null
  
  if (settings) {
    if (settings.aiConfig?.apiKey) {
      settings.aiConfig.apiKey = decrypt(settings.aiConfig.apiKey)
    }
    if (settings.telegramConfig?.botToken) {
      settings.telegramConfig.botToken = decrypt(settings.telegramConfig.botToken)
    }
  }

  return {
    ...settings,
    webhookSecret: profile?.webhookSecret || undefined,
    defaultHourlyRate: profile?.defaultHourlyRate ? Number(profile.defaultHourlyRate) : 0
  } as SaveSettingsInput
}

/**
 * Public version of getSettings that masks sensitive data.
 * Ideal for passing data to Client Components.
 */
export async function getSanitizedSettings() {
  const settings = await getSettings()
  if (!settings) return null

  const mask = (str: string) => {
    if (!str) return ''
    if (str.length <= 8) return '********'
    return `${str.slice(0, 4)}...${str.slice(-4)}`
  }

  return {
    ...settings,
    aiConfig: settings.aiConfig ? {
      ...settings.aiConfig,
      apiKey: settings.aiConfig.apiKey ? mask(settings.aiConfig.apiKey) : ''
    } : { provider: 'google', apiKey: '', baseUrl: '', model: 'gemini-1.5-pro' },
    telegramConfig: settings.telegramConfig ? {
      ...settings.telegramConfig,
      botToken: settings.telegramConfig.botToken ? mask(settings.telegramConfig.botToken) : ''
    } : { botToken: '', chatId: '' },
    webhookSecret: settings.webhookSecret ? mask(settings.webhookSecret) : ''
  }
}

export async function saveSettings(data: SaveSettingsInput) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Encrypt sensitive fields before saving
  const settingsToSave = { ...data }
  
  // Only encrypt if it's not a masked value (user didn't change it)
  // or if they explicitly provided a new one.
  // Note: In a real app, we'd check if the value changed.
  // For simplicity, we encrypt whatever is passed if it doesn't look like a mask.
  const isMasked = (str: string) => str.includes('...') && str.length < 20
  
  if (settingsToSave.aiConfig?.apiKey && !isMasked(settingsToSave.aiConfig.apiKey)) {
    settingsToSave.aiConfig.apiKey = encrypt(settingsToSave.aiConfig.apiKey)
  } else if (isMasked(settingsToSave.aiConfig.apiKey)) {
    // If it's masked, we don't want to overwrite with the mask!
    // We fetch the old settings to keep the original encrypted value.
    const oldSettings = await getSettings()
    if (oldSettings?.aiConfig?.apiKey) {
      settingsToSave.aiConfig.apiKey = encrypt(oldSettings.aiConfig.apiKey)
    }
  }

  if (settingsToSave.telegramConfig?.botToken && !isMasked(settingsToSave.telegramConfig.botToken)) {
    settingsToSave.telegramConfig.botToken = encrypt(settingsToSave.telegramConfig.botToken)
  } else if (settingsToSave.telegramConfig?.botToken && isMasked(settingsToSave.telegramConfig.botToken)) {
    const oldSettings = await getSettings()
    if (oldSettings?.telegramConfig?.botToken) {
      settingsToSave.telegramConfig.botToken = encrypt(oldSettings.telegramConfig.botToken)
    }
  }

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      settings: settingsToSave as any,
      defaultHourlyRate: data.defaultHourlyRate || 0
    }
  })

  revalidatePath('/settings')
  return { success: true }
}

export async function rotateWebhookSecret() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const newSecret = crypto.randomUUID()

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      webhookSecret: newSecret
    }
  })

  revalidatePath('/settings')
  return { success: true, secret: newSecret }
}
