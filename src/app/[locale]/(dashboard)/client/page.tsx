import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderKanban, ArrowRight, User, Clock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDuration } from "@/lib/locale";

export default async function ClientAreaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { clientProfileId: user.id },
        { projectAccess: { some: { profileId: user.id } } },
        { customer: { email: user.email } }
      ]
    },
    include: { 
      freelancer: { select: { fullName: true, email: true } },
      activities: {
        orderBy: { startTime: 'desc' },
        take: 5
      }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Área do Cliente</h1>
        <p className="text-muted-foreground font-medium">Projetos onde você atua como revisor de atividades.</p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed border-2 p-10 flex flex-col items-center justify-center text-center bg-muted/20">
          <FolderKanban className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
          <h2 className="text-lg font-bold">Nenhum projeto encontrado</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
            Você ainda não foi convidado para nenhum projeto como cliente.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const totalMinutes = project.activities.reduce((sum, a) => sum + a.durationMinutes, 0);
            
            return (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 overflow-hidden">
                <CardHeader className="bg-muted/30 group-hover:bg-primary/5 transition-colors">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                    <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                       {project.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description || "Sem descrição."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/30 p-2 rounded-md">
                     <User className="w-3 h-3" />
                     <span className="font-bold">Freelancer:</span>
                     <span className="truncate">{project.freelancer.fullName || project.freelancer.email}</span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Últimas Atividades</span>
                    <div className="space-y-1">
                      {project.activities.length === 0 ? (
                        <p className="text-xs italic text-muted-foreground">Sem atividades registradas recentemente.</p>
                      ) : (
                        project.activities.map(act => (
                          <div key={act.id} className="flex justify-between items-center text-[11px] font-medium border-b border-muted pb-1">
                             <span className="truncate pr-4" title={act.description}>{act.description}</span>
                             <span className="flex items-center gap-1 shrink-0 font-bold opacity-70">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDuration(act.durationMinutes)}
                             </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Link href={`/projects/${project.id}`}>
                    <Button className="w-full font-bold uppercase tracking-widest text-xs h-10 mt-2">
                      Acessar Projeto <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
