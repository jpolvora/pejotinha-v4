'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { encrypt, decrypt } from '@/lib/encryption'
import crypto from 'crypto'
import { actionWrapper, ActionResponse } from "@/lib/action-utils"

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

export async function getSettings(): Promise<SaveSettingsInput | null> {
  const result = await actionWrapper(async (user) => {
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
  })
  return result.success ? result.data! : null
}

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

export async function saveSettings(data: SaveSettingsInput): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const settingsToSave = { ...data }
    const isMasked = (str: string) => str.includes('...') && str.length < 20
    
    if (settingsToSave.aiConfig?.apiKey && !isMasked(settingsToSave.aiConfig.apiKey)) {
      settingsToSave.aiConfig.apiKey = encrypt(settingsToSave.aiConfig.apiKey)
    } else if (isMasked(settingsToSave.aiConfig.apiKey)) {
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
  })
}

export async function rotateWebhookSecret(): Promise<ActionResponse> {
  return await actionWrapper(async (user) => {
    const newSecret = crypto.randomUUID()
    await prisma.profile.update({
      where: { id: user.id },
      data: { webhookSecret: newSecret }
    })
    revalidatePath('/settings')
    return newSecret
  })
}
