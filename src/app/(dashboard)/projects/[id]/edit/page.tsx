import { getProjectById, updateProject } from "@/actions/projects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  const actionWithId = async (formData: FormData) => {
    "use server";
    await updateProject(params.id, formData);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="shrink-0 transition-transform hover:-translate-x-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground">Update information for {project.name}.</p>
        </div>
      </div>

      <Card className="shadow-lg border-2 border-border/50 rounded-xl overflow-hidden">
        <CardHeader className="bg-card border-b border-border/50 pb-6">
           <CardTitle className="text-xl">Project Details</CardTitle>
           <CardDescription>Make changes below and save to update the project.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={actionWithId} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Project Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={project.name} 
                required 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Input 
                id="description" 
                name="description" 
                defaultValue={project.description || ''} 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hourly_rate" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hourly Rate</Label>
              <Input 
                id="hourly_rate" 
                name="hourly_rate" 
                type="number" 
                step="0.01" 
                min="0" 
                defaultValue={project.hourly_rate?.toString() || '0'} 
                required 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech_stacks" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tech Stacks (comma separated)</Label>
              <Input 
                id="tech_stacks" 
                name="tech_stacks" 
                defaultValue={(project.tech_stacks || []).join(", ")} 
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
              />
            </div>
            <div className="pt-4 flex justify-end border-t border-border/50 mt-8 pt-6">
              <SubmitButton label="Save Changes" />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
