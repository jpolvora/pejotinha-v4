"use client"

import { Sparkles, ArrowRight, MousePointer2 } from "lucide-react"
import { OnboardingWizard } from "./onboarding-wizard"
import { Badge } from "@/components/ui/badge"

export function OnboardingBanner() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-8 mb-12 group transition-all hover:shadow-2xl hover:shadow-primary/5">
      {/* Background Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[60px]" />
      
      <div className="relative flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="rounded-full bg-primary/5 text-primary border-primary/20 font-black px-4 py-1 uppercase tracking-[0.2em] text-[10px] animate-bounce">
              <Sparkles className="w-3 h-3 mr-2" /> Novo Workspace
            </Badge>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
              Seu Pejotinha está <span className="text-primary text-glow-sm">quase pronto</span>.
            </h2>
            <p className="text-muted-foreground font-medium text-lg max-w-xl leading-relaxed">
              Para começar a rastrear horas e gerar relatórios profissionais, precisamos configurar seu primeiro cliente e projeto. Leva menos de 2 minutos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-8 pt-4">
            <OnboardingWizard />
            
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground/60 transition-opacity group-hover:opacity-100">
              <MousePointer2 className="w-4 h-4" />
              Clique para iniciar o guia interativo
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-72 h-72 items-center justify-center relative">
          <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse-slow" />
          <div className="w-56 h-56 rounded-[40px] bg-card/40 backdrop-blur-xl border border-muted/50 shadow-2xl rotate-6 flex items-center justify-center group-hover:rotate-12 transition-transform duration-700">
             <div className="flex flex-col gap-3 p-6 w-full">
                <div className="h-2 w-2/3 bg-muted/40 rounded-full" />
                <div className="h-2 w-full bg-muted/20 rounded-full" />
                <div className="h-2 w-1/2 bg-muted/30 rounded-full" />
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/20" />
                  <div className="h-6 w-16 rounded-lg bg-primary/10 border border-primary/20" />
                </div>
             </div>
          </div>
          <div className="absolute -bottom-4 -left-4 w-40 h-40 rounded-[32px] bg-background/60 backdrop-blur-md border border-muted/50 shadow-xl -rotate-12 flex items-center justify-center group-hover:-rotate-18 transition-transform duration-700">
             <div className="flex flex-col gap-2 p-5 w-full">
                <div className="h-1.5 w-full bg-primary/20 rounded-full" />
                <div className="h-1.5 w-3/4 bg-primary/10 rounded-full" />
                <div className="mt-3 h-12 w-full rounded-xl border border-dashed border-primary/30 flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-primary/40" />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
