import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { LogActivityForm } from "@/components/log-activity-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getActivityById } from "@/actions/activities";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { id, activityId } = await params;
  
  const [project, tasks, activity] = await Promise.all([
    prisma.project.findUnique({ where: { id } }),
    prisma.task.findMany({ where: { projectId: id } }),
    getActivityById(activityId)
  ]);

  if (!project || !activity) return notFound();

  return (
    <div className="space-y-8 mt-6">
      <div className="flex items-center gap-6 border-b border-dashed pb-8">
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0 h-12 w-12 rounded-2xl border-2 hover:bg-primary/10 hover:border-primary/30 transition-all">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Edit3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight uppercase">Edit Activity</h1>
            <p className="text-muted-foreground font-medium">Refining details for <span className="text-foreground font-bold">{project.name}</span>.</p>
          </div>
        </div>
      </div>

      <Card className="shadow-none border-2 border-border/50 rounded-[32px] overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="p-8 md:p-12">
          <LogActivityForm 
            projectId={project.id} 
            tasks={tasks} 
            activity={activity}
            initialEvidences={activity.evidences}
          />
        </div>
      </Card>
    </div>
  );
}
