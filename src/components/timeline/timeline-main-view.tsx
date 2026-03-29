"use client";

import { Activity, Lock, CalendarDays, Timer, Image, Sparkles, ExternalLink, GitBranch, Briefcase, EyeOff, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatDuration } from "@/lib/locale";

export type TimelineItem = {
  id: string;
  type: 'activity' | 'personal';
  title: string;
  description: string;
  startTime: Date | null;
  endTime: Date | null;
  durationMinutes: number;
  isPrivate: boolean;
  projectSlug?: string;
  projectName?: string;
  customerName?: string;
  evidenceCount: number;
  status: string;
  source: string;
};

export function TimelineMainView({ items, loading }: { items: TimelineItem[], loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 opacity-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-sm font-medium animate-pulse">Sincronizando timeline inteligente...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center space-y-4 border-2 border-dashed border-muted/50 rounded-3xl bg-muted/5">
        <Activity className="w-16 h-16 text-muted-foreground/30" />
        <div>
          <h4 className="text-xl font-bold bg-gradient-to-r from-muted-foreground/80 to-muted-foreground/40 bg-clip-text text-transparent">Nada no horizonte...</h4>
          <p className="text-sm text-muted-foreground">Experimente ajustar os filtros ou registrar uma nova atividade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      {/* Connector Line */}
      <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-muted/20" />
      
      {items.map((item, idx) => {
        const isPersonal = item.type === "personal";
        const isGit = item.source === 'git';
        const isIA = item.source === 'ia' || item.source === 'magic';
        const isPrivate = item.isPrivate;

        let EventIcon = Activity;
        let iconBg = "bg-primary";
        let iconColor = "text-white";
        let statusBadge = null;

        if (isPrivate && isPersonal) {
          EventIcon = Lock;
          iconBg = "bg-muted";
          iconColor = "text-muted-foreground";
        } else if (isPersonal) {
          EventIcon = CalendarDays;
          iconBg = "bg-orange-500";
        } else if (isGit) {
          EventIcon = GitBranch;
          iconBg = "bg-indigo-600";
        } else if (isIA) {
          EventIcon = Sparkles;
          iconBg = "bg-fuchsia-600";
        }

        return (
          <div key={`${item.id}-${idx}`} className="group relative pl-14 transition-all duration-300 hover:z-10 animate-in slide-in-from-left-2 fade-in">
            {/* Timeline Dot with Icon */}
            <div className={`absolute left-0 top-3 h-14 w-14 rounded-full border-4 border-background ${iconBg} flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-lg ring-1 ring-black/5`}>
              <EventIcon className={`w-6 h-6 ${iconColor}`} />
            </div>

            <div className="flex flex-col bg-card/40 hover:bg-card/70 backdrop-blur-sm border border-muted/50 rounded-[28px] p-6 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/5 group-hover:border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {item.startTime ? formatDateTime(item.startTime) : '—'}
                  </span>
                  {isPrivate && (
                    <Badge variant="outline" className="text-[9px] h-4 font-black p-0 px-2 bg-amber-500/10 text-amber-600 border-none uppercase">
                      <EyeOff className="w-2.5 h-2.5 mr-1" /> Privado
                    </Badge>
                  )}
                  {item.durationMinutes > 0 && (
                    <Badge variant="secondary" className="text-[9px] h-4 font-black p-0 px-2 bg-primary/10 text-primary border-none uppercase">
                      <Timer className="w-2.5 h-2.5 mr-1" /> {formatDuration(item.durationMinutes)}
                    </Badge>
                  )}
                </div>

                {item.projectName && (
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{item.customerName}</span>
                     <Badge className="text-[10px] font-black px-3 py-0.5 rounded-full bg-primary text-white border-none shadow-sm shadow-primary/20">
                      {item.projectName}
                     </Badge>
                   </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <h4 className={`text-xl font-black tracking-tight leading-tight ${isPrivate && isPersonal ? 'text-muted-foreground/60 italic' : 'text-foreground/90'}`}>
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 min-w-[140px] md:pl-6 md:border-l border-dashed border-muted/50">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-[0.2em]">Status Final</span>
                    {item.status === 'approved' ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-black text-[11px] uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                         <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
                      </div>
                    ) : item.status === 'rejected' ? (
                      <div className="flex items-center gap-1 text-red-600 font-black text-[11px] uppercase bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                         Recusado
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 font-black text-[11px] uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                         Pendente
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-5 border-t border-dashed border-muted/50">
                <div className="flex items-center gap-3">
                  {item.evidenceCount > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/80 hover:text-primary transition-colors cursor-pointer bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                      <Image className="w-3.5 h-3.5" />
                      {item.evidenceCount} {item.evidenceCount === 1 ? 'PROVA' : 'PROVAS'}
                    </div>
                  )}
                  {isIA && (
                    <Badge variant="outline" className="border-fuchsia-500/20 text-fuchsia-600 bg-fuchsia-500/5 text-[9px] font-black px-3 py-1 rounded-full uppercase">
                      <Sparkles className="w-3 h-3 mr-1.5 text-fuchsia-400" /> IA Smart
                    </Badge>
                  )}
                  {isGit && (
                    <Badge variant="outline" className="border-indigo-500/20 text-indigo-600 bg-indigo-500/5 text-[9px] font-black px-3 py-1 rounded-full uppercase">
                      <GitBranch className="w-3 h-3 mr-1.5 text-indigo-400" /> Git
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                   <button className="hidden sm:flex items-center gap-1.5 text-[10px] font-black uppercase text-muted-foreground/60 hover:text-primary transition-all px-4 py-2 rounded-full hover:bg-primary/5 select-none">
                     Log forense <ExternalLink className="w-3 h-3" />
                   </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
