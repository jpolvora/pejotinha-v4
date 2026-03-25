import { getProjects, createProject, deleteProject } from "@/actions/projects";
import { getCustomers } from "@/actions/customers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Trash, Folder, Pencil } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage(props: { searchParams?: Promise<{ customer?: string }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const customerId = searchParams.customer;

  const projects = await getProjects(customerId);
  const customers = await getCustomers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground">Manage ongoing and completed projects.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <p className="text-sm text-destructive">You must create a Client first to start a project.</p>
            ) : (
              <form action={createProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" placeholder="Website Redesign" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input id="description" name="description" placeholder="Short description..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate</Label>
                  <Input id="hourly_rate" name="hourly_rate" type="number" step="0.01" min="0" placeholder="e.g. 50" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tech_stacks">Tech Stacks (comma separated)</Label>
                  <Input id="tech_stacks" name="tech_stacks" placeholder="React, Node.js, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_id">Client</Label>
                  <select 
                    id="customer_id" 
                    name="customer_id" 
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a client...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <SubmitButton label="Create Project" />
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-sm">No projects found. Create one to log your tasks.</p>
          ) : (
            <div className="grid gap-4">
              {projects.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex justify-between items-center group">
                    <Link href={`/projects/${p.id}`} className="flex-1">
                      <div className="flex items-center gap-3">
                        <Folder className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-lg group-hover:underline">{p.name}</p>
                          <p className="text-sm text-muted-foreground">Client: {p.customers?.name}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <Link href={`/projects/${p.id}/edit`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <form action={async () => {
                        "use server";
                        await deleteProject(p.id);
                      }}>
                        <Button variant="ghost" size="icon" type="submit" className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
