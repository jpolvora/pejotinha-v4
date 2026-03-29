"use client";

import { useState } from "react";
import { createInvitation } from "@/actions/invitations";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Shield, UserPlus, Send, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner"; 

export function InviteClientModal({ projectId, projectName }: { projectId: string, projectName: string }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "supervisor">("owner");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email) {
      toast.error("Por favor, insira um e-mail.");
      return;
    }

    setLoading(true);
    try {
      const result = await createInvitation(projectId, email, role);
      if (result.success) {
        toast.success(result.message);
        if (result.token) {
           setToken(result.token);
        } else {
           setOpen(false);
           setEmail("");
        }
      } else {
        toast.error(result.error || "Erro ao enviar convite.");
      }
    } catch (error) {
       console.error(error);
       toast.error("Erro interno ao processar convite.");
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    if (!token) return;
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button size="sm" className="bg-primary text-white font-bold h-9 gap-2 rounded-xl group transition-all">
          <UserPlus className="w-4 h-4" />
          Convidar Cliente
          <span className="hidden sm:inline-block opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
        </Button>
      } />
      <SheetContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl w-full">
        <div className="bg-gradient-to-br from-primary/10 to-background p-8 border-b border-primary/5">
          <SheetHeader>
            <SheetTitle className="text-2xl font-black tracking-tight text-primary flex items-center gap-2">
              <Mail className="w-6 h-6" /> Convidar para {projectName}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground font-medium pt-2">
              Envie um acesso exclusivo para seu cliente visualizar a timeline e aprovar entregas.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="p-8 space-y-6">
          {token ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold mb-1">
                     <Check className="w-5 h-5" /> Convite Gerado com Sucesso!
                  </div>
                  <p className="text-xs text-muted-foreground mr-1">O link de acesso expira em 7 dias.</p>
               </div>
               
               <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Link de Acesso Direto</Label>
                 <div className="flex gap-2">
                   <Input value={`${window.location.origin}/invite/${token}`} readOnly className="h-11 rounded-xl bg-muted/30 font-mono text-[11px]" />
                   <Button onClick={copyToken} className="h-11 w-11 p-0 rounded-xl shrink-0" variant="secondary">
                     <Copy className="w-4 h-4" />
                   </Button>
                 </div>
               </div>

               <Button onClick={() => { setOpen(false); setToken(null); setEmail(""); }} className="w-full h-12 rounded-2xl font-black uppercase text-xs">
                 Fechar
               </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> E-mail do Cliente
                </Label>
                <Input 
                  id="email" 
                  placeholder="ex: cliente@empresa.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl bg-muted/20 border-muted-foreground/10 focus:ring-primary text-sm font-medium" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Nível de Acesso
                </Label>
                <Select value={role} onValueChange={(v: any) => setRole(v)}>
                  <SelectTrigger className="h-12 rounded-2xl bg-muted/20 border-muted-foreground/10">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl bg-card">
                    <SelectItem value="owner" className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm block">Owner (Padrão)</span>
                        <span className="text-[10px] text-muted-foreground">Pode aprovar atividades e visualizar tudo.</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="supervisor" className="rounded-xl py-3 focus:bg-primary/5 cursor-pointer">
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm block">Supervisor</span>
                        <span className="text-[10px] text-muted-foreground">Apenas visualiza e comenta na timeline.</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleInvite} 
                disabled={loading} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 space-x-2"
              >
                {loading ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Convite Digital</span>
                  </>
                )}
              </Button>
            </>
          )}

          <div className="flex justify-center pt-2">
             <Badge variant="outline" className="text-[9px] uppercase border-none text-muted-foreground">Segurança Multi-tenant Ativa</Badge>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
