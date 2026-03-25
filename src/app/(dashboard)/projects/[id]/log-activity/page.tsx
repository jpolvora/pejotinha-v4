import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LogActivityForm } from "@/components/log-activity-form";
import { getProjectById } from "@/actions/projects";
import { notFound } from "next/navigation";

export default async function LogActivityPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getProjectById(params.id);

  if (!project) return notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-6">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${project.id}`}>
          <Button variant="ghost" size="icon" className="shrink-0 transition-transform hover:-translate-x-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Activity</h1>
          <p className="text-muted-foreground">Register work completed for {project.name}.</p>
        </div>
      </div>

      <Card className="shadow-lg border-2 border-border/50 rounded-xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50 pb-6">
           <CardTitle className="text-xl">Activity & Proof of Work</CardTitle>
           <CardDescription>Record your time, sprint context, and paste (Ctrl+V) screenshots directly here.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          <LogActivityForm projectId={project.id} />
        </CardContent>
      </Card>
    </div>
  );
}
