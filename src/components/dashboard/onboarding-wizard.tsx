"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Sparkles, 
  UserPlus, 
  FolderPlus, 
  CheckCircle2, 
  ArrowRight, 
  Loader2,
  Rocket,
  ShieldCheck,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCustomer } from "@/actions/customers"
import { createProject } from "@/actions/projects"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Step = "welcome" | "client" | "project" | "success"

export function OnboardingWizard() {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("welcome")
  const [loading, setLoading] = React.useState(false)
  const [clientId, setClientId] = React.useState<string | null>(null)
  const router = useRouter()

  // Form states
  const [clientData, setClientData] = React.useState({ name: "", email: "" })
  const [projectData, setProjectData] = React.useState({ name: "", description: "" })

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", clientData.name)
      formData.append("email", clientData.email)
      
      const result = await createCustomer(formData)
      if (result.success) {
        setClientId(result.data.id)
        setStep("project")
        toast.success("Cliente criado com sucesso!")
      } else {
        toast.error(result.error || "Erro ao criar cliente")
      }
    } catch (error) {
      toast.error("Erro inesperado ao criar cliente")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", projectData.name)
      formData.append("customer_id", clientId)
      formData.append("description", projectData.description)
      
      const result = await createProject(formData)
      if (result.success) {
        setStep("success")
        toast.success("Projeto configurado com sucesso!")
        router.refresh()
      } else {
        toast.error(result.error || "Erro ao criar projeto")
      }
    } catch (error) {
      toast.error("Erro inesperado ao criar projeto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) setTimeout(() => setStep("welcome"), 300)
    }}>
      <SheetTrigger
        render={
          <Button className="rounded-full bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all h-12 px-8 font-black uppercase tracking-widest text-xs">
            <Rocket className="w-4 h-4 mr-2" /> Iniciar Setup Guiado
          </Button>
        }
      />
      
      <SheetContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-xl border-l border-muted/50 p-0 shadow-2xl overflow-y-auto scrollbar-hide">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex gap-0.5 z-50">
          {(["welcome", "client", "project", "success"] as Step[]).map((s, i) => {
            const steps: Step[] = ["welcome", "client", "project", "success"]
            const currentIdx = steps.indexOf(step)
            return (
              <div 
                key={s} 
                className={cn(
                  "flex-1 transition-all duration-500",
                  i <= currentIdx ? "bg-primary" : "bg-muted/30"
                )} 
              />
            )
          })}
        </div>

        <div className="p-8 mt-6">
          {step === "welcome" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tight leading-tight">Vamos turbinar seu <span className="text-primary text-glow-sm">Workspace</span>.</h2>
                <p className="text-muted-foreground font-medium">Preparamos um setup rápido para você começar a registrar suas atividades e faturar clientes ainda hoje.</p>
              </div>

              <div className="grid gap-4">
                {[
                  { icon: ShieldCheck, title: "Isolamento Total", desc: "Cada cliente tem seus próprios dados e projetos protegidos." },
                  { icon: TrendingUp, title: "Métricas Reais", desc: "Acompanhe seu rendimento por projeto em tempo real." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl border border-muted/50 bg-accent/5">
                    <item.icon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={() => setStep("client")} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">
                Próximo Passo <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === "client" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <UserPlus className="w-3 h-3" /> Passo 01
                </div>
                <h2 className="text-2xl font-black tracking-tight">Quem é seu primeiro cliente?</h2>
                <p className="text-sm text-muted-foreground">Pode ser uma empresa ou um contato direto.</p>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="c-name" className="text-xs font-black uppercase tracking-widest opacity-60">Nome do Cliente</Label>
                  <Input 
                    id="c-name" 
                    placeholder="Ex: Google, Acme Corp..." 
                    className="h-14 rounded-xl bg-accent/5 border-muted/50 focus:border-primary/50 transition-all font-medium"
                    value={clientData.name}
                    onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-email" className="text-xs font-black uppercase tracking-widest opacity-60">Email para Faturamento (Opcional)</Label>
                  <Input 
                    id="c-email" 
                    type="email"
                    placeholder="financeiro@empresa.com" 
                    className="h-14 rounded-xl bg-accent/5 border-muted/50 focus:border-primary/50 transition-all font-medium"
                    value={clientData.email}
                    onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar e Continuar"}
                </Button>
              </form>
            </div>
          )}

          {step === "project" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                  <FolderPlus className="w-3 h-3" /> Passo 02
                </div>
                <h2 className="text-2xl font-black tracking-tight">Qual o projeto atual?</h2>
                <p className="text-sm text-muted-foreground">O projeto onde você passará suas próximas horas.</p>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="p-name" className="text-xs font-black uppercase tracking-widest opacity-60">Nome do Projeto</Label>
                  <Input 
                    id="p-name" 
                    placeholder="Ex: Refaturamento App, UI Design..." 
                    className="h-14 rounded-xl bg-accent/5 border-muted/50 focus:border-primary/50 transition-all font-medium"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-desc" className="text-xs font-black uppercase tracking-widest opacity-60">Descrição (Opcional)</Label>
                  <Textarea 
                    id="p-desc" 
                    placeholder="Breve resumo das responsabilidades..." 
                    className="min-h-[120px] rounded-xl bg-accent/5 border-muted/50 focus:border-primary/50 transition-all font-medium resize-none"
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalizar Configuração"}
                </Button>
              </form>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-700 py-10 text-center">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                <div className="relative w-full h-full rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight">Tudo pronto!</h2>
                <p className="text-muted-foreground font-medium">Seu workspace foi configurado com sucesso. Agora você já pode registrar atividades, criar tarefas e acompanhar sua evolução.</p>
              </div>

              <div className="pt-6">
                <Button onClick={() => setOpen(false)} className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                  Explorar meu Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
