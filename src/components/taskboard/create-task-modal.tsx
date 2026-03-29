"use client";

import { useState } from "react";
import { createTask } from "@/actions/tasks";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Type, AlignLeft } from "lucide-react";
import { toast } from "sonner";

interface CreateTaskModalProps {
  projects: { id: string; name: string }[];
}

export function CreateTaskModal({ projects }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createTask(formData);
      if (result.success) {
        toast.success("Tarefa criada com sucesso!");
        setOpen(false);
      } else {
        toast.error(result.error || "Erro ao criar tarefa");
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="rounded-full bg-primary text-white shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest px-6 h-10 hover:scale-105 transition-all">
            <Plus className="w-3.5 h-3.5 mr-2" /> Nova Tarefa
          </Button>
        }
      />
      
      <SheetContent className="sm:max-w-[480px] bg-background/95 backdrop-blur-xl border-l border-muted/50 p-8 shadow-2xl">
        <SheetHeader className="mb-10 mt-6">
          <SheetTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Plus className="w-6 h-6" />
            </div>
            Nova Tarefa
          </SheetTitle>
          <p className="text-muted-foreground text-sm font-medium">Preencha os detalhes para lançar sua nova missão.</p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="project_id" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Projeto Relacionado</Label>
            <Select name="project_id" required>
              <SelectTrigger className="rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all">
                <SelectValue placeholder="Selecione um projeto..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-muted/50 shadow-2xl">
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="rounded-xl py-3 capitalize">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="name" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Título da Tarefa</Label>
            <div className="relative group">
              <Type className="absolute left-5 top-5 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="name"
                name="name"
                required
                placeholder="Ex: Refatorar API de Webhooks"
                className="pl-14 rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="description" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Descrição & Contexto</Label>
            <div className="relative group">
              <AlignLeft className="absolute left-5 top-5 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
              <Textarea
                id="description"
                name="description"
                placeholder="Quais são os requisitos e detalhes?"
                className="pl-14 rounded-[20px] border-muted/50 min-h-[140px] bg-muted/20 focus:ring-primary/20 py-4 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="due_date" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Deadline</Label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-5 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input
                  id="due_date"
                  name="due_date"
                  type="date"
                  className="pl-14 rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="priority" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Prioridade</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger className="rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-muted/50 shadow-2xl">
                  <SelectItem value="low" className="rounded-xl py-3">Baixa</SelectItem>
                  <SelectItem value="medium" className="rounded-xl py-3">Média</SelectItem>
                  <SelectItem value="high" className="rounded-xl py-3">Alta</SelectItem>
                  <SelectItem value="urgent" className="rounded-xl py-3">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="status" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Status Inicial</Label>
              <Select name="status" defaultValue="pending">
                <SelectTrigger className="rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-muted/50 shadow-2xl">
                  <SelectItem value="pending" className="rounded-xl py-3">Para Fazer</SelectItem>
                  <SelectItem value="doing" className="rounded-xl py-3">Em Andamento</SelectItem>
                  <SelectItem value="done" className="rounded-xl py-3">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="tags" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Tags (Sprints, Áreas...)</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="v1.0, sprint-1, ui"
                className="rounded-[20px] border-muted/50 h-14 bg-muted/20 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-16 rounded-[24px] bg-primary text-white font-black uppercase tracking-[0.25em] shadow-xl shadow-primary/25 hover:scale-[1.02] hover:shadow-primary/40 active:scale-[0.98] transition-all text-xs"
            >
              {loading ? "Processando..." : "Lançar Tarefa"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
