import { getProjectById } from "@/actions/projects";
import { getActivities, deleteActivity, approveActivity, generateProjectSummary, updateActivity } from "@/actions/activities";
import { getProjectTasks, updateTaskStatus, deleteTask, type task_status } from "@/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Trash, Clock, CheckCircle, FileText, Plus, Briefcase, Users, Link as LinkIcon, GitCommit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EvidenceManager } from "@/components/evidence-manager";
import { EvidenceGallery } from "@/components/evidence-gallery";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/locale";
import { MagicNarrator } from "@/components/magic-narrator";
import { InviteClientModal } from "@/components/clients/invite-client-modal";
import { InvitationsList } from "@/components/invitations-list";

export default async function ProjectDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const project = await getProjectById(params.id);
  if (!project) return notFound();

  const userAccess = (project as any).projectAccess?.[0];
  const isFreelancer = project.freelancerId === user?.id;
  const isClientOwner = project.clientProfileId === user?.id || userAccess?.role === 'owner';
  const isSupervisor = userAccess?.role === 'supervisor';
  
  // Anyone with access can view, but only freelancer/owner can approve/reject
  const canApprove = isFreelancer || isClientOwner;
  const isViewOnly = !isFreelancer && isSupervisor;

  const activities = await getActivities(project.id);
  const tasks = await getProjectTasks(project.id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-dashed pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground/90">{project.name}</h1>
          <p className="text-muted-foreground font-medium text-lg mt-1">{project.description || "Gerencie suas atividades e entregas."}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm font-bold text-muted-foreground/80 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full border">
               <Briefcase className="w-3.5 h-3.5" /> {project.customers?.name || "N/A"}
            </span>
            {project.clientProfile && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                 <Users className="w-3.5 h-3.5" /> Client: {project.clientProfile.fullName || project.clientProfile.email}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
           <div className="bg-accent/50 p-4 rounded-2xl border border-dashed flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-1">Taxa/Hora</span>
              <span className="text-xl font-black text-primary">{project.hourly_rate ? formatCurrency(Number(project.hourly_rate)) : "R$ 0,00"}</span>
           </div>
           <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center min-w-[120px]">
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600/60 mb-1">Tempo Total</span>
              <span className="text-xl font-black text-emerald-600">
                {formatDuration(activities?.reduce((acc: number, curr: any) => acc + (curr.durationMinutes || 0), 0) || 0)}
              </span>
           </div>
           {isFreelancer && (
             <Link href={`/projects/${project.id}/log-activity`} className="h-full">
                <Button className="h-full px-8 rounded-2xl font-black uppercase tracking-tighter group transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                   Log Activity <Plus className="ml-2 w-5 h-5 group-hover:rotate-90 transition-transform" />
                </Button>
             </Link>
           )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Create Activity (Only for freelancers) */}
        {isFreelancer && (
          <div className="col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Register time or manage tasks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/projects/${project.id}/log-activity`} className="w-full block">
                  <Button className="w-full flex justify-center text-sm font-semibold shadow hover:shadow-md transition-all">
                    <Plus className="mr-2 h-4 w-4" /> Log New Activity
                  </Button>
                </Link>
                <Link href={`/projects/${project.id}/tasks/new`} className="w-full block">
                  <Button variant="outline" className="w-full flex justify-center text-sm font-semibold">
                    <Plus className="mr-2 h-4 w-4" /> Create New Task
                  </Button>
                </Link>

                <form action={async () => {
                  "use server";
                  await generateProjectSummary(project.id);
                }}>
                  <Button variant="secondary" className="w-full flex justify-center text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 border-none shadow-lg">
                    ✨ Generate AI Summary
                  </Button>
                </form>

                <MagicNarrator activities={activities.map(a => ({
                  source: (a as any).source,
                  description: a.description,
                  startTime: a.startTime
                }))} />
              </CardContent>
            </Card>

            {/* Invitation Section */}
            <Card className="border-primary/10 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Compartilhar Projeto
                </CardTitle>
                <CardDescription className="text-xs">Dê acesso ao seu cliente para visualizar a timeline.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <InviteClientModal projectId={project.id} projectName={project.name} />
                <div className="pt-2 border-t border-dashed border-primary/20">
                   <InvitationsList projectId={project.id} />
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Tasks</CardTitle>
                <CardDescription>Break down deliverables.</CardDescription>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tasks defined yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="text-sm p-3 border rounded-lg bg-background/50 hover:bg-background transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            task.status === 'done' ? 'bg-green-100 text-green-700' :
                            task.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {task.status}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-foreground leading-tight">{task.name}</p>
                        {task.description && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Right Column: Activities Timeline */}
        <div className={`space-y-4 ${!isFreelancer ? "col-span-3" : "col-span-1 md:col-span-2"}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Activity Log</h2>
            <Link href={`/reports?projectId=${project.id}`}>
               <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/50">
                  <FileText className="w-3 h-3" /> Detailed Report
               </Button>
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activities logged yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => {
                const latestApproval = act.approvals && act.approvals.length > 0 
                  ? act.approvals[act.approvals.length - 1] 
                  : null;

                const status = (act as any).status || latestApproval?.status || 'pending';

                return (
                  <Card key={act.id} className={status === 'approved' ? 'border-l-4 border-l-green-500/50' : status === 'rejected' ? 'border-l-4 border-l-red-500/50' : ''}>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div className="flex-1 pr-4">
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                          {act.description}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                            status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800' :
                            status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800' :
                            status === 'pending_evidence' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                          }`}>
                            {status === 'pending_evidence' ? 'waiting evidence' : status}
                          </span>
                          {(act as any).isPaid && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-600 text-white border border-blue-700 shadow-sm animate-pulse">
                              PAID
                            </span>
                          )}
                        </CardTitle>
                        {act.executionPlan && (
                           <CardDescription className="mt-1">{act.executionPlan}</CardDescription>
                        )}
                        {(act.sprint || act.ticket) && (
                          <div className="flex gap-2 mt-2">
                            {act.sprint && <span className="text-xs bg-secondary text-secondary-foreground font-medium px-2 py-0.5 rounded-full">{act.sprint}</span>}
                            {act.ticket && <span className="text-xs bg-secondary text-secondary-foreground font-medium px-2 py-0.5 rounded-full">{act.ticket}</span>}
                          </div>
                        )}
                        {act.startTime && act.endTime && (
                          <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(act.startTime)} - {formatDateTime(act.endTime)}
                          </div>
                        )}
                        {act.summary && (
                          <div className="mt-4 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-blue-900 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300 italic ring-1 ring-blue-200 dark:ring-blue-700">
                            <strong>AI Summary:</strong> {act.summary}
                          </div>
                        )}
                        {act.value !== undefined && Number(act.value) > 0 && (
                          <div className="text-xs font-semibold text-green-600 mt-1 dark:text-green-400">
                             + {formatCurrency(Number(act.value))}
                          </div>
                        )}
                      </div>
                      
                        <div className="flex gap-2">
                          {isFreelancer && !(act as any).isPaid && (
                            <form action={async (formData: FormData) => {
                                "use server";
                                formData.append("is_paid", "true");
                                await updateActivity(act.id, formData);
                            }}>
                               <input type="hidden" name="project_id" value={project.id} />
                               <input type="hidden" name="description" value={act.description} />
                               <input type="hidden" name="status" value={status} />
                              <Button variant="outline" size="sm" type="submit" className="h-8 text-[10px] font-black uppercase text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10">
                                Mark as Paid
                              </Button>
                            </form>
                          )}
                          {isFreelancer && (
                            <form action={async () => {
                              "use server";
                              await deleteActivity(act.id, project.id);
                            }}>
                              <Button variant="ghost" size="icon" type="submit" className="text-destructive h-8 w-8 hover:bg-destructive/10">
                                <Trash className="h-4 w-4" />
                              </Button>
                            </form>
                          )}
                        </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-b pb-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(act.durationMinutes)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{act.evidences?.length || 0} Evidences</span>
                        </div>
                      </div>
                      
                      {act.task && (
                        <div className="mb-4">
                           <Badge variant="outline" className="text-[10px] h-5 font-black px-2 uppercase tracking-widest bg-primary/5 text-primary border-primary/20">
                             Missão: {act.task.name}
                           </Badge>
                        </div>
                      )}

                      <EvidenceGallery evidences={act.evidences} />

                      {isFreelancer && (
                        <div className="mt-6 pt-4 border-t border-dashed">
                           <EvidenceManager 
                              activityId={act.id} 
                              projectId={project.id} 
                              initialEvidences={act.evidences} 
                           />
                        </div>
                      )}

                      {canApprove && !isFreelancer && status !== 'approved' && (
                        <form action={approveActivity} className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                          <input type="hidden" name="activity_id" value={act.id} />
                          <input type="hidden" name="project_id" value={project.id} />
                          <Button name="status" value="approved" type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                             <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve Activity
                          </Button>
                          <Button name="status" value="revision" type="submit" variant="outline" size="sm">Request Revision</Button>
                          <Button name="status" value="rejected" type="submit" variant="destructive" size="sm">Reject</Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
