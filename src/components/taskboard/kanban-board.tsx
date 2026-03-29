"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  closestCorners,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { createPortal } from "react-dom";
import { updateTaskPosition } from "@/actions/tasks";
import { toast } from "sonner";

interface KanbanBoardProps {
  initialTasks: any[];
}

const COLUMNS = [
  { id: "pending", title: "Para Fazer", accent: "bg-amber-400 shadow-amber-500/50" },
  { id: "doing", title: "Em Andamento", accent: "bg-blue-500 shadow-blue-500/50" },
  { id: "done", title: "Concluído", accent: "bg-emerald-500 shadow-emerald-500/50" },
];

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: tasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0)),
    }));
  }, [tasks]);

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask) return;

    // Moving a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].status !== tasks[overIndex].status) {
          const updatedTasks = [...tasks];
          updatedTasks[activeIndex].status = tasks[overIndex].status;
          return arrayMove(updatedTasks, activeIndex, overIndex);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    // Moving a Task over a Column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const updatedTasks = [...tasks];
        updatedTasks[activeIndex].status = overId as any;
        return arrayMove(updatedTasks, activeIndex, activeIndex);
      });
    }
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    try {
      // Find the new index and status
      const columnTasks = tasks.filter(t => t.status === activeTask.status);
      const newPos = columnTasks.findIndex(t => t.id === activeTask.id);
      
      const result = await updateTaskPosition(activeTask.id, activeTask.status, newPos);
      if (!result.success) {
        toast.error("Erro ao sincronizar posição da tarefa");
        setTasks(initialTasks); // Revert on failure
      }
    } catch (error) {
       toast.error("Ocorreu um erro ao atualizar a tarefa");
       setTasks(initialTasks);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-8 h-full overflow-x-auto pb-10 scrollbar-none">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            accentColor={col.accent}
            tasks={col.tasks}
          />
        ))}
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <DragOverlay>
            {activeTask && <KanbanCard task={activeTask} />}
          </DragOverlay>,
          document.body
        )}
    </DndContext>
  );
}
