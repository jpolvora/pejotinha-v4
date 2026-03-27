'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SaveSettingsInput, saveSettings, rotateWebhookSecret } from '@/actions/settings'
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
import { Bot, Save, Loader2, Cpu, Receipt, Share2, RefreshCw, Copy, Check, Globe, Zap, Settings2 } from 'lucide-react'

interface SettingsFormProps {
  initialData: SaveSettingsInput | null
}

const PROVIDERS = [
  { id: 'gemini', label: 'Google Gemini (Native)', icon: Zap },
  { id: 'openai', label: 'OpenAI', icon: Bot },
  { id: 'anthropic', label: 'Anthropic Claude', icon: Cpu },
  { id: 'groq', label: 'Groq Cloud', icon: Zap },
  { id: 'mistral', label: 'Mistral AI', icon: Globe },
  { id: 'deepseek', label: 'DeepSeek', icon: Globe },
  { id: 'custom', label: 'Custom Provider', icon: Settings2 },
]

const ENDPOINTS: Record<string, { label: string, value: string }[]> = {
  gemini: [
    { label: 'Google Generative Language (Stable v1)', value: 'https://generativelanguage.googleapis.com/v1' },
    { label: 'Google Generative Language (Beta v1beta)', value: 'https://generativelanguage.googleapis.com/v1beta' },
    { label: 'Google OpenAI Shim (v1beta)', value: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
  ],
  openai: [{ label: 'Official OpenAI API (v1)', value: 'https://api.openai.com/v1' }],
  anthropic: [{ label: 'Anthropic API (v1)', value: 'https://api.anthropic.com/v1' }],
  groq: [{ label: 'Groq API (v1)', value: 'https://api.groq.com/openai/v1' }],
  mistral: [{ label: 'Mistral API (v1)', value: 'https://api.mistral.ai/v1' }],
  deepseek: [{ label: 'DeepSeek API (v1)', value: 'https://api.deepseek.com/v1' }],
  custom: [],
}

const MODELS: Record<string, { label: string, value: string }[]> = {
  gemini: [
    { label: 'Gemini 2.0 Flash (Fastest)', value: 'gemini-2.0-flash' },
    { label: 'Gemini 2.0 Flash-Lite', value: 'gemini-2.0-flash-lite' },
    { label: 'Gemini 2.0 Pro Exp', value: 'gemini-2.0-pro-exp-02-05' },
    { label: 'Gemini 1.5 Pro (Standard)', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
  ],
  openai: [
    { label: 'GPT-4o (Latest)', value: 'gpt-4o' },
    { label: 'GPT-4o-mini', value: 'gpt-4o-mini' },
    { label: 'o1', value: 'o1' },
    { label: 'o1-mini', value: 'o1-mini' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  ],
  anthropic: [
    { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-latest' },
    { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-latest' },
    { label: 'Claude 3 Opus', value: 'claude-3-opus-latest' },
  ],
  groq: [
    { label: 'Llama 3.3 70B Versatile', value: 'llama-3.3-70b-versatile' },
    { label: 'Llama 3.1 8B Instant', value: 'llama-3.1-8b-instant' },
    { label: 'Mixtral 8x7B Instructions', value: 'mixtral-8x7b-32768' },
  ],
  deepseek: [
    { label: 'DeepSeek Chat (V3)', value: 'deepseek-chat' },
    { label: 'DeepSeek Reasoner (R1)', value: 'deepseek-reasoner' },
  ],
  mistral: [
    { label: 'Mistral Large (Latest)', value: 'mistral-large-latest' },
    { label: 'Mistral Small (Latest)', value: 'mistral-small-latest' },
    { label: 'Codestral', value: 'codestral-latest' },
  ],
  custom: [],
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)
  
  const [formData, setFormData] = useState<SaveSettingsInput>({
    aiConfig: {
      provider: String(initialData?.aiConfig?.provider || 'gemini'),
      apiKey: String(initialData?.aiConfig?.apiKey || ''),
      baseUrl: String(initialData?.aiConfig?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta'),
      model: String(initialData?.aiConfig?.model || 'gemini-2.0-flash'),
    },
    telegramConfig: {
      botToken: String(initialData?.telegramConfig?.botToken || ''),
      chatId: String(initialData?.telegramConfig?.chatId || ''),
    },
    webhookSecret: initialData?.webhookSecret || '',
    defaultHourlyRate: initialData?.defaultHourlyRate || 0
  })

  const [isRotating, setIsRotating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [originUrl, setOriginUrl] = useState('https://pejotinha-v4.vercel.app')

  // Hook to detect hydration completion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin)
    }
  }, [])

  const [provider, setProvider] = useState<string>(formData.aiConfig.provider)
  const [isCustomMode, setIsCustomMode] = useState({
    baseUrl: !ENDPOINTS[formData.aiConfig.provider]?.some(e => e.value === formData.aiConfig.baseUrl),
    model: !MODELS[formData.aiConfig.provider]?.some(m => m.value === formData.aiConfig.model),
  })

  const handleAiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      aiConfig: { ...prev.aiConfig, [name]: value } 
    }))
  }

  const handleProviderChange = (newProvider: string | null) => {
    if (!newProvider) return
    setProvider(newProvider)
    const defaultEndpoint = ENDPOINTS[newProvider]?.[0]?.value || ''
    const defaultModel = MODELS[newProvider]?.[0]?.value || ''
    
    setFormData(prev => ({
      ...prev,
      aiConfig: {
        ...prev.aiConfig,
        provider: newProvider,
        baseUrl: defaultEndpoint,
        model: defaultModel
      }
    }))
    setIsCustomMode({
      baseUrl: newProvider === 'custom',
      model: newProvider === 'custom'
    })
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

  const handleRotateSecret = async () => {
    if (!confirm('Tem certeza que deseja rotacionar sua chave de webhook?')) return
    setIsRotating(true)
    try {
      const result = await rotateWebhookSecret()
      if (result && result.success) {
        setFormData(prev => ({ ...prev, webhookSecret: result.data as string }))
        toast({ title: 'Sucesso', description: 'Nova chave de integração gerada.' })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao rotacionar a chave.', variant: 'destructive' })
    } finally {
      setIsRotating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({ title: 'Copiado', description: 'Chave copiada para a área de transferência.' })
  }

  // Calculate Request URL Preview
  const getRequestPreview = () => {
    const { provider: p, baseUrl, model } = formData.aiConfig
    if (p === 'gemini' && !baseUrl.includes('/openai')) {
      return `${baseUrl}/models/${model}:generateContent`
    }
    return `${baseUrl}/chat/completions (POST)`
  }

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, defaultHourlyRate: parseFloat(e.target.value) || 0 }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Inteligência Artificial (LLM)</CardTitle>
          </div>
          <CardDescription>
            Configure seu provedor para habilitar a extração mágica de logs de atividades.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Chave de API (Secret Key)</Label>
            <Input
              id="apiKey"
              name="apiKey"
              type="password"
              placeholder="Sua chave de API secreta (Ex: AIzaSy... ou sk-...)"
              value={formData.aiConfig.apiKey}
              onChange={handleAiChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Provedor</Label>
              <Select value={provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <p.icon className="h-3 w-3" />
                        {p.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 col-span-1 md:col-span-2">
              <Label>Base URL / Endpoint</Label>
              <div className="flex gap-2">
                {!isCustomMode.baseUrl && provider !== 'custom' ? (
                  <Select 
                    value={formData.aiConfig.baseUrl} 
                    onValueChange={(val: string | null) => {
                      if (!val) return
                      if (val === 'custom') setIsCustomMode(p => ({ ...p, baseUrl: true }))
                      else setFormData(p => ({ ...p, aiConfig: { ...p.aiConfig, baseUrl: val }}))
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENDPOINTS[provider]?.map(e => (
                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                      ))}
                      <SelectItem value="custom">✏️ Manual (Personalizado)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      name="baseUrl" 
                      value={formData.aiConfig.baseUrl} 
                      onChange={handleAiChange} 
                      placeholder="https://api.proxy.com/v1"
                    />
                    {provider !== 'custom' && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsCustomMode(p => ({ ...p, baseUrl: false }))}>
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label>Modelo</Label>
              <div className="flex gap-2">
                {!isCustomMode.model && provider !== 'custom' ? (
                  <Select 
                    value={formData.aiConfig.model} 
                    onValueChange={(val: string | null) => {
                      if (!val) return
                      if (val === 'custom') setIsCustomMode(p => ({ ...p, model: true }))
                      else setFormData(p => ({ ...p, aiConfig: { ...p.aiConfig, model: val }}))
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS[provider]?.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label} ({m.value})</SelectItem>
                      ))}
                      <SelectItem value="custom">✏️ Manual (Personalizado)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <Input 
                      name="model" 
                      value={formData.aiConfig.model} 
                      onChange={handleAiChange} 
                      placeholder="Identificador do modelo (Ex: gpt-4o)"
                    />
                    {provider !== 'custom' && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsCustomMode(p => ({ ...p, model: false }))}>
                        Reset
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-black/5 border border-dashed flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Preview da Chamada de API</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{provider.toUpperCase()}</span>
            </div>
            <code className="text-[11px] font-mono break-all text-primary/80">
              {getRequestPreview()}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>Integração Telegram</CardTitle>
          </div>
          <CardDescription>
            Configure seu bot para logar atividades via linguagem natural.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="botToken">Token do Bot</Label>
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
              <Label htmlFor="chatId">Seu Chat ID</Label>
              <Input
                id="chatId"
                name="chatId"
                placeholder="Ex: 12345678"
                value={formData.telegramConfig?.chatId || ''}
                onChange={handleTelegramChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle>Configurações Financeiras</CardTitle>
          </div>
          <CardDescription>
            Defina valores padrão para cobrança.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 max-w-xs">
            <Label htmlFor="defaultHourlyRate">Valor/Hora Global (Padrão Freelancer)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">R$</span>
              <Input
                id="defaultHourlyRate"
                name="defaultHourlyRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10 font-bold"
                value={formData.defaultHourlyRate}
                onChange={handleRateChange}
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              Este valor será usado como fallback se não houver valor definido no cliente ou projeto.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm px-6 py-4 flex justify-end gap-4 bg-muted/20">
        <Button type="submit" disabled={isPending} className="gap-2">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </Button>
      </Card>
      
      {/* External Integrations Section (Webhooks) - Minimal version for space */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <CardTitle>Webhooks & API Key</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
           <div className="flex gap-2">
                <Input
                  readOnly
                  type="password"
                  value={formData.webhookSecret || 'Nenhuma chave gerada'}
                  className="font-mono text-xs bg-muted/50"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => formData.webhookSecret && copyToClipboard(formData.webhookSecret)}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={handleRotateSecret} disabled={isRotating}>
                  <RefreshCw className={`h-4 w-4 ${isRotating ? 'animate-spin' : ''}`} />
                </Button>
            </div>
        </CardContent>
      </Card>
    </form>
  )
}
