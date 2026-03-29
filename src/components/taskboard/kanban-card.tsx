"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, GripVertical, MessageSquare, Timer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-primary/10 border-2 border-dashed border-primary rounded-2xl h-[120px] mb-3"
      />
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative mb-3 bg-card/80 backdrop-blur-sm border-muted/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md rounded-2xl overflow-hidden cursor-default"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-black tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {task.name}
            </h4>
            {task.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed opacity-70">
                {task.description}
              </p>
            )}
          </div>
          
          <div 
            {...attributes} 
            {...listeners} 
            className="p-1 rounded-md hover:bg-muted cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-muted/20 pt-3">
          <div className="flex items-center gap-3">
            {task.dueDate && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                <CalendarDays className="w-3 h-3" />
                {format(new Date(task.dueDate), "dd MMM", { locale: ptBR })}
              </div>
            )}
            
            {task.project?.name && (
              <Badge variant="outline" className="text-[8px] h-4 font-black px-1.5 bg-primary/5 text-primary border-primary/10 uppercase tracking-widest whitespace-nowrap">
                {task.project.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
             <button className="p-1 rounded-full hover:bg-primary/10 text-muted-foreground/40 hover:text-primary transition-all">
                <Timer className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
