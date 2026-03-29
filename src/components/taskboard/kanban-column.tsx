"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard } from "./kanban-card";
import { Badge } from "@/components/ui/badge";
import { Circle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: any[];
  accentColor: string;
}

export function KanbanColumn({ id, title, tasks, accentColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "Column",
      status: id,
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-full min-w-[320px] max-w-[400px] h-full bg-muted/20 backdrop-blur-md rounded-[32px] p-5 border border-muted/50 transition-all duration-300",
        isOver && "bg-muted/40 border-primary/20 shadow-inner"
      )}
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-3 h-3 rounded-full animate-pulse ring-4 ring-background shadow-lg", accentColor)} />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
            {title}
          </h3>
          <Badge variant="secondary" className="text-[10px] font-black h-5 px-2 bg-background/50 border-muted/50 rounded-full">
            {tasks.length}
          </Badge>
        </div>
        
        <button className="p-1 rounded-full hover:bg-muted text-muted-foreground/40 hover:text-foreground transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-[500px] scrollbar-none pb-4">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            
            {tasks.length === 0 && (
              <div className="h-24 border-2 border-dashed border-muted/40 rounded-2xl flex items-center justify-center opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Solte aqui</span>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
