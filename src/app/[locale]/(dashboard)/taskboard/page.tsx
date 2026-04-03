import { getAllTasks } from "@/actions/tasks";
import { getProjects } from "@/actions/projects";
import { KanbanBoard } from "@/components/taskboard/kanban-board";
import { CreateTaskModal } from "@/components/taskboard/create-task-modal";
import { KanbanSquare, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Taskboard Agile | Pejotinha",
  description: "Gerencie suas tarefas com agilidade e precisão.",
};

export default async function TaskboardPage() {
  const [tasks, projects] = await Promise.all([
    getAllTasks(),
    getProjects()
  ]);

  return (
    <div className="flex flex-col h-full space-y-10 animate-in fade-in zoom-in duration-500 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white">
                <KanbanSquare className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent uppercase">Agile Taskboard</h1>
                <p className="text-muted-foreground text-sm font-medium ml-1">Visualize o progresso e conquiste seus épicos.</p>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-full border-muted/50 bg-background/50 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest px-6 h-10 hover:bg-muted transition-all">
             <Filter className="w-3.5 h-3.5 mr-2" /> Filtrar Projetos
           </Button>
           <CreateTaskModal projects={projects} />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialTasks={tasks} />
      </div>

      {/* Background Decor */}
      <div className="fixed top-1/4 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />
    </div>
  );
}
