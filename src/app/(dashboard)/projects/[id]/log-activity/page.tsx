import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LogActivityForm } from "@/components/log-activity-form";
import { getProjectById } from "@/actions/projects";
import { getProjectTasks } from "@/actions/tasks";
import { notFound } from "next/navigation";

export default async function LogActivityPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getProjectById(params.id);
  const tasks = await getProjectTasks(params.id);

  if (!project) return notFound();

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-6 border-b border-dashed pb-8">
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0 h-12 w-12 rounded-2xl border-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight uppercase">Log Activity</h1>
          <p className="text-muted-foreground font-medium">Register work completed for <span className="text-foreground font-bold">{project.name}</span>.</p>
        </div>
      </div>

      <Card className="shadow-none border-2 border-border/50 rounded-[32px] overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="p-8 md:p-12">
          <LogActivityForm projectId={project.id} tasks={tasks} />
        </div>
      </Card>
    </div>
  );
}
