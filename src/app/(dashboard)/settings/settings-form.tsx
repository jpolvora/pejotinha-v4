'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SaveSettingsInput, saveSettings } from '@/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'
import { Bot, Save, Loader2, Cpu, Receipt } from 'lucide-react'

interface SettingsFormProps {
  initialData: SaveSettingsInput | null
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)
  
  const [formData, setFormData] = useState<SaveSettingsInput>({
    aiConfig: {
      provider: String(initialData?.aiConfig?.provider || 'gemini'),
      apiKey: String(initialData?.aiConfig?.apiKey || ''),
      baseUrl: String(initialData?.aiConfig?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai/'),
      model: String(initialData?.aiConfig?.model || 'gemini-3.1-flash-lite'),
    },
    telegramConfig: {
      botToken: String(initialData?.telegramConfig?.botToken || ''),
      chatId: String(initialData?.telegramConfig?.chatId || ''),
    }
  })

  const [modelType, setModelType] = useState<string>(
    [
      'gemini-3.1-pro', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-1.5-flash',
      'gpt-5.4-thinking', 'gpt-5.4-mini', 'gpt-5.3-instant', 'gpt-4o'
    ].includes(String(formData.aiConfig.model)) 
      ? String(formData.aiConfig.model) 
      : 'custom'
  )

  const commonBaseUrls = [
    { label: 'Google Gemini (v1beta - OpenAI Shim)', value: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
    { label: 'Google Gemini (v1 - OpenAI Shim)', value: 'https://generativelanguage.googleapis.com/v1/openai/' },
    { label: 'Google Gemini (Native v1beta)', value: 'https://generativelanguage.googleapis.com/v1beta' },
    { label: 'Google Gemini (Native v1 - Stable)', value: 'https://generativelanguage.googleapis.com/v1' },
    { label: 'OpenAI API (v1)', value: 'https://api.openai.com/v1' },
    { label: 'Groq Cloud', value: 'https://api.groq.com/openai/v1' },
    { label: 'Mistral AI', value: 'https://api.mistral.ai/v1' },
    { label: 'DeepSeek', value: 'https://api.deepseek.com/v1' },
    { label: 'Local (Ollama)', value: 'http://localhost:11434/v1' },
    { label: 'Local (LM Studio)', value: 'http://localhost:1234/v1' },
  ]

  const [urlType, setUrlType] = useState<string>(
    commonBaseUrls.some(u => u.value === formData.aiConfig.baseUrl) ? formData.aiConfig.baseUrl : 'custom'
  )

  const handleAiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      aiConfig: { ...prev.aiConfig, [name]: value } 
    }))
  }

  const handleTelegramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      telegramConfig: { 
        botToken: prev.telegramConfig?.botToken || '',
        chatId: prev.telegramConfig?.chatId || '',
        [name]: value 
      } 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      await saveSettings(formData)
      toast({
        title: 'Sucesso',
        description: 'Configurações salvas com sucesso.',
      })
      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Houve um erro ao salvar as configurações.',
        variant: 'destructive',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Inteligência Artificial (Gemini/OpenAI/Custom)</CardTitle>
          </div>
          <CardDescription>
            Configure sua chave de API para habilitar a extração mágica de logs de atividades via linguagem natural. 
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Chave de API (API Key)</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="Sua chave de API secreta (Ex: AIzaSy...)"
              value={formData.aiConfig.apiKey}
              onChange={handleAiChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="url-select">Provedor / Base URL</Label>
              <Select 
                value={urlType} 
                onValueChange={(value: string | null) => {
                  if (!value) return;
                  setUrlType(value);
                  if (value !== 'custom') {
                    setFormData(prev => ({ 
                      ...prev, 
                      aiConfig: { ...prev.aiConfig, baseUrl: value } 
                    }));
                  }
                }}
              >
                <SelectTrigger id="url-select">
                  <SelectValue placeholder="Selecione o provedor" />
                </SelectTrigger>
                <SelectContent>
                  {commonBaseUrls.map(u => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                  <SelectItem value="custom">Outro (URL Customizada)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model-select">Modelo de IA</Label>
              <Select 
                value={modelType} 
                onValueChange={(value: string | null) => {
                  if (!value) return;
                  setModelType(value);
                  if (value !== 'custom') {
                    setFormData(prev => ({ 
                      ...prev, 
                      aiConfig: { ...prev.aiConfig, model: value } 
                    }));
                  }
                }}
              >
                <SelectTrigger id="model-select">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3.1-pro">Gemini 3.1 Pro (Estado da arte ✨)</SelectItem>
                  <SelectItem value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Super Rápido)</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Equilibrado)</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Legado)</SelectItem>
                  <SelectItem value="gpt-5.4-thinking">GPT-5.4 Thinking (Raciocínio Avançado)</SelectItem>
                  <SelectItem value="gpt-5.4-mini">GPT-5.4 Mini (Eficiente)</SelectItem>
                  <SelectItem value="gpt-5.3-instant">GPT-5.3 Instant</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o (Legado)</SelectItem>
                  <SelectItem value="custom">Outro (Especificar manualmente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {urlType === 'custom' && (
            <div className="grid gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="baseUrl">URL do Endpoint Customizada</Label>
              <Input
                id="baseUrl"
                name="baseUrl"
                type="url"
                placeholder="https://sua-api.com/v1/"
                value={formData.aiConfig.baseUrl}
                onChange={handleAiChange}
                required
              />
              <p className="text-[10px] text-muted-foreground italic">Inclua o /v1 ou /openai/ se necessário.</p>
            </div>
          )}

          {modelType === 'custom' && (
            <div className="grid gap-2 pt-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="model">Identificador do Modelo Customizado</Label>
              <div className="relative">
                <Cpu className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="model"
                  name="model"
                  placeholder="Ex: o1-preview ou meu-modelo-lms"
                  className="pl-9"
                  value={formData.aiConfig.model}
                  onChange={handleAiChange}
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic">Use o identificador exato da API do seu provedor.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>Integração Telegram</CardTitle>
          </div>
          <CardDescription>
            Configure seu bot do Telegram para criar tarefas e logar atividades usando linguagem natural.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="botToken">Token do Bot (Opcional para Webhook)</Label>
              <Input
                id="botToken"
                name="botToken"
                type="password"
                placeholder="123456789:ABC..."
                value={formData.telegramConfig?.botToken || ''}
                onChange={handleTelegramChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="chatId">Seu Chat ID (Telegram)</Label>
              <Input
                id="chatId"
                name="chatId"
                placeholder="Ex: 12345678"
                value={formData.telegramConfig?.chatId || ''}
                onChange={handleTelegramChange}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para descobrir seu Chat ID, envie uma mensagem para o bot @userinfobot ou similar no Telegram.
          </p>
        </CardContent>
      </Card>

      <CardFooter className="py-3 flex justify-end">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Todas as Configurações
        </Button>
      </CardFooter>
    </form>
  )
}
