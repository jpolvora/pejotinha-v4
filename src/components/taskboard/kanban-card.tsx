"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, GripVertical, MessageSquare, Timer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  task: any;
}

export function KanbanCard({ task }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const totalMinutes = task.activities?.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0) || 0;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const priorityConfig = {
    urgent: { label: "Urgente", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    high: { label: "Alta", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    medium: { label: "Média", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    low: { label: "Baixa", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
  };

  const currentPriority = (task.priority as keyof typeof priorityConfig) || "medium";
  const priorityStyle = priorityConfig[currentPriority];

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-20 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[28px] h-[140px] mb-4"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative mb-4 bg-card/40 backdrop-blur-xl border-muted/30 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 rounded-[28px] overflow-hidden cursor-default"
    >
      {/* Priority Indicator Line */}
      <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-60", 
        currentPriority === 'urgent' ? 'bg-red-500' : 
        currentPriority === 'high' ? 'bg-orange-500' :
        currentPriority === 'medium' ? 'bg-blue-500' : 'bg-slate-500'
      )} />

      <CardContent className="p-5 pl-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={cn("text-[8px] h-4 font-black px-2 uppercase tracking-widest border shrink-0", priorityStyle.className)}>
                {priorityStyle.label}
              </Badge>
              
              {task.tags?.map((tag: string, i: number) => (
                <Badge key={i} variant="secondary" className="text-[8px] h-4 font-bold px-2 bg-muted/50 text-muted-foreground border-none lowercase tracking-tight">
                  #{tag}
                </Badge>
              ))}
            </div>

            <h4 className="text-sm font-black tracking-tight leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {task.name}
            </h4>
            
            {task.description && (
              <p className="text-[11px] text-muted-foreground/60 line-clamp-2 leading-relaxed font-medium italic">
                {task.description}
              </p>
            )}
          </div>
          
          <div 
            {...attributes} 
            {...listeners} 
            className="p-1.5 rounded-xl hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-all shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-muted/10 pt-4">
          <div className="flex items-center gap-4">
            {task.dueDate && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">
                <CalendarDays className="w-3.5 h-3.5 text-primary/40" />
                {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
              </div>
            )}
            
            {totalMinutes > 0 && (
              <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500/80 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                <Timer className="w-3.5 h-3.5" />
                {timeString}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
             {task.project?.name && (
                <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] max-w-[80px] truncate">
                  {task.project.name}
                </div>
             )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
