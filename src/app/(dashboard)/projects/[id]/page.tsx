import { getProjectById } from "@/actions/projects";
import { getActivities, deleteActivity, approveActivity } from "@/actions/activities";
import { getProjectTasks, updateTaskStatus, deleteTask, type task_status } from "@/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Trash, Clock, CheckCircle, FileText, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EvidenceUpload } from "@/components/evidence-upload";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/locale";

export default async function ProjectDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  const isClient = profile?.role === 'client';

  const project = await getProjectById(params.id);
  
  if (!project) return notFound();

  const activities = await getActivities(project.id);
  const tasks = await getProjectTasks(project.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground">{project.description || "No description provided."}</p>
        <p className="text-sm font-medium mt-1">Client: {project.customers?.name}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Create Activity (Only for freelancers) */}
        {!isClient && (
          <div className="col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Register time or manage tasks.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
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
        <div className={`space-y-4 ${isClient ? "col-span-3" : "col-span-1 md:col-span-2"}`}>
          <h2 className="text-xl font-semibold">Activity Log</h2>
          {activities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No activities logged yet.</p>
          ) : (
            <div className="space-y-4">
              {activities.map((act) => {
                const latestApproval = act.approvals && act.approvals.length > 0 
                  ? act.approvals[act.approvals.length - 1] 
                  : null;

                return (
                  <Card key={act.id}>
                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {act.description}
                          {latestApproval && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              latestApproval.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              latestApproval.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {latestApproval.status.toUpperCase()}
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
                        {act.value !== undefined && Number(act.value) > 0 && (
                          <div className="text-xs font-semibold text-green-600 mt-1 dark:text-green-400">
                             + {formatCurrency(Number(act.value))}
                          </div>
                        )}
                      </div>
                      
                      {!isClient && (
                        <form action={async () => {
                          "use server";
                          await deleteActivity(act.id, project.id);
                        }}>
                          <Button variant="ghost" size="icon" type="submit" className="text-destructive h-8 w-8">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </form>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(act.durationMinutes)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{act.evidences?.length || 0} Evidences</span>
                        </div>
                      </div>
                      
                      {act.evidences && act.evidences.length > 0 && (
                        <div className="mt-4 flex flex-col gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Attached Evidences</span>
                          <div className="flex flex-wrap gap-2">
                             {act.evidences.map((ev) => {
                               const isMedia = ev.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|mp4|webm)$/i);
                               const isVideo = ev.fileUrl?.match(/\.(mp4|webm)$/i);
                               return (
                               <div key={ev.id} className={`text-sm flex ${isMedia && ev.evidenceType === 'file' ? 'items-start' : 'items-center'} gap-1 border rounded bg-muted/30 max-w-full overflow-hidden ${isMedia && ev.evidenceType === 'file' ? 'p-1' : 'px-2 py-1'}`}>
                                 {ev.evidenceType === 'file' && (
                                   isMedia ? (
                                     <a href={ev.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="block relative w-32 h-24 group rounded overflow-hidden">
                                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10 text-white font-medium text-xs">
                                         Full Size
                                       </div>
                                       {isVideo ? (
                                          <video src={ev.fileUrl ?? undefined} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                       ) : (
                                          <img src={ev.fileUrl ?? undefined} alt="Evidence media" className="w-full h-full object-cover" />
                                       )}
                                     </a>
                                   ) : (
                                     <a href={ev.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate pb-0">
                                        View Attached File
                                     </a>
                                   )
                                 )}
                                 {ev.evidenceType === 'link' && (
                                   <a href={ev.content ?? undefined} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate pb-0">
                                     🔗 {ev.content}
                                   </a>
                                 )}
                                 {ev.evidenceType === 'text' && (
                                   <span className="text-muted-foreground flex items-center gap-1 truncate pb-0" title={ev.content || ''}>
                                     📝 {ev.content?.substring(0, 50)}{(ev.content?.length || 0) > 50 ? '...' : ''}
                                   </span>
                                 )}
                                 {!ev.evidenceType && ev.fileUrl && (
                                   <a href={ev.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 truncate pb-0">
                                      View External File
                                   </a>
                                 )}
                               </div>
                             )})}
                          </div>
                        </div>
                      )}

                      {!isClient && !latestApproval?.status?.includes('approved') && (
                        <EvidenceUpload activityId={act.id} projectId={project.id} />
                      )}

                      {isClient && (!latestApproval || latestApproval.status !== 'approved') && (
                        <form action={approveActivity} className="mt-6 flex flex-wrap gap-2 border-t pt-4">
                          <input type="hidden" name="activity_id" value={act.id} />
                          <input type="hidden" name="project_id" value={project.id} />
                          <Button name="status" value="approved" type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white">Approve</Button>
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
