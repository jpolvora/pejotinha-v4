"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Briefcase, Eye, EyeOff, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type TimelineFiltersProps = {
  projects: { id: string, name: string }[];
  onFilter: (filters: { projectId?: string, startDate?: string, endDate?: string, visibility: "all" | "public" | "private" }) => void;
};

export function TimelineFilters({ projects, onFilter }: TimelineFiltersProps) {
  const [projectId, setProjectId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [visibility, setVisibility] = useState<"all" | "public" | "private">("all");

  const handleApply = () => {
    onFilter({
      projectId: projectId === "all" ? undefined : projectId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      visibility
    });
  };

  const handleClear = () => {
    setProjectId("all");
    setStartDate("");
    setEndDate("");
    setVisibility("all");
    onFilter({ visibility: "all" });
  };

  const visibilityOptions: { id: "all" | "public" | "private", label: string, icon: any }[] = [
    { id: 'all', label: 'Tudo', icon: Eye },
    { id: 'public', label: 'Público', icon: Search },
    { id: 'private', label: 'Privado', icon: EyeOff }
  ];

  return (
    <div className="rounded-2xl border bg-card/40 backdrop-blur-md shadow-sm p-6 space-y-6 border-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          Filtros de Visibilidade
        </h3>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary">
          <X className="w-3 h-3 mr-1" /> Limpar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <Briefcase className="w-3 h-3" /> Projeto
          </Label>
          <Select value={projectId} onValueChange={(val) => val && setProjectId(val)}>
            <SelectTrigger className="bg-background/50 border-muted-foreground/20 focus:ring-primary h-10 rounded-xl">
              <SelectValue placeholder="Todos os projetos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <Calendar className="w-3 h-3" /> Início
          </Label>
          <Input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-background/50 border-muted-foreground/20 focus:ring-primary h-10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <Calendar className="w-3 h-3" /> Fim
          </Label>
          <Input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-background/50 border-muted-foreground/20 focus:ring-primary h-10 rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
            <Eye className="w-3 h-3" /> Visibilidade
          </Label>
          <div className="grid grid-cols-3 gap-1 bg-muted/30 p-1 rounded-xl border border-muted/50 h-10">
            {visibilityOptions.map((v) => (
               <button
                key={v.id}
                onClick={() => setVisibility(v.id)}
                className={`flex items-center justify-center gap-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                  visibility === v.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:bg-white/5'
                }`}
               >
                <v.icon className="w-2.5 h-2.5" /> {v.label}
               </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleApply} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest rounded-xl h-11 shadow-lg shadow-primary/20">
          Aplicar Filtros Inteligentes
        </Button>
      </div>
    </div>
  );
}
