'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Wand2, Loader2, Copy, Check } from 'lucide-react'
import { generateNarrativeSummary } from '@/actions/ai'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MagicNarratorProps {
  activities: { source: string, description: string, startTime?: Date | null }[]
}

export function MagicNarrator({ activities }: MagicNarratorProps) {
  const [isPending, setIsPending] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    setIsPending(true)
    try {
      const result = await generateNarrativeSummary(activities)
      if (result.success) {
        setSummary(result.summary!)
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Falha ao gerar o resumo.',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsPending(false)
    }
  }

  const copyToClipboard = () => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Copiado',
      description: 'Resumo copiado para a área de transferência.',
    })
  }

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGenerate} 
        disabled={isPending || activities.length === 0}
        variant="secondary"
        className="w-full gap-2 font-semibold bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 transition-all duration-300"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Wand2 className="h-4 w-4 text-amber-500" />}
        Gerar Resumo Narrativo (IA)
      </Button>

      {summary && (
        <Card className="border-amber-500/30 bg-amber-500/5 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-bold text-amber-700 dark:text-amber-400">Resumo Sugerido</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-foreground/80">
            {summary}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
