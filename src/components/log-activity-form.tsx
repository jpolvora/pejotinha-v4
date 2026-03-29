"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Link as LinkIcon, FileText, Camera, File as FileIcon, Sparkles, Loader2, Bot, GitCommit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createActivity, updateActivity } from "@/actions/activities";
import { useRouter } from "next/navigation";
import { extractActivityPayload } from "@/actions/ai";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Evidence = {
  id: string;
  type: 'file' | 'link' | 'text' | 'observation' | 'commit' | 'gif' | 'video' | 'image';
  file?: File;
  content?: string;
  previewUrl?: string;
};

export function LogActivityForm({ 
  projectId, 
  tasks = [], 
  activity, 
  initialEvidences = [] 
}: { 
  projectId: string, 
  tasks?: any[],
  activity?: any,
  initialEvidences?: any[]
}) {
  const [previewItem, setPreviewItem] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const isEditing = !!activity;
  const { toast } = useToast();
  const [description, setDescription] = useState(activity?.description || "");
  const [selectedTaskId, setSelectedTaskId] = useState<string>(activity?.taskId || "");
  const [sprint, setSprint] = useState(activity?.sprint || "");
  const [ticket, setTicket] = useState(activity?.ticket || "");
  const [startTime, setStartTime] = useState(activity?.startTime ? new Date(activity.startTime).toISOString().slice(0, 16) : "");
  const [endTime, setEndTime] = useState(activity?.endTime ? new Date(activity.endTime).toISOString().slice(0, 16) : "");
  const [duration, setDuration] = useState(activity?.durationMinutes || 0);
  const [evidences, setEvidences] = useState<Evidence[]>(initialEvidences.map(ev => ({
    id: ev.id,
    type: ev.evidenceType as any,
    content: ev.content || ev.fileUrl || "",
    previewUrl: ev.fileUrl || undefined
  })));
  const [deletedEvidenceIds, setDeletedEvidenceIds] = useState<string[]>([]);

  const linkedTask = tasks.find(t => t.id === selectedTaskId);

  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Automatically calculate duration
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (end > start) {
        setDuration(Math.round((end - start) / 60000));
      }
    }
  }, [startTime, endTime]);

  // Handle Ctrl+V to paste images/links/text/gifs
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                const isGif = file.type === 'image/gif';
                setEvidences(prev => [...prev, { 
                  id: Date.now().toString() + i, 
                  type: isGif ? 'gif' : 'file', 
                  file, 
                  previewUrl 
                }]);
            }
        } else if (item.type === 'text/plain') {
            item.getAsString(text => {
                const id = Date.now().toString() + i;
                if (text.startsWith('http')) {
                    const isVideo = text.match(/\.(mp4|webm|mov)$/i);
                    const isGif = text.match(/\.gif$/i);
                    setEvidences(prev => [...prev, { 
                      id, 
                      type: isVideo ? 'video' : (isGif ? 'gif' : 'link'), 
                      content: text 
                    }]);
                } else if (/^[0-9a-f]{7,40}$/i.test(text)) {
                    setEvidences(prev => [...prev, { id, type: 'commit', content: text }]);
                } else {
                    setEvidences(prev => [...prev, { id, type: 'text', content: text }]);
                }
            });
        }
    }
  };

  const removeEvidence = async (id: string) => {
    if (initialEvidences.some(ie => ie.id === id)) {
      setDeletedEvidenceIds(prev => [...prev, id]);
    }
    setEvidences(prev => prev.filter(e => e.id !== id));
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newEvidences = files.map((file, i) => ({
        id: Date.now().toString() + i,
        type: 'file' as const,
        file,
        previewUrl: (file.type.startsWith('image/') || file.type.startsWith('video/')) ? URL.createObjectURL(file) : undefined
      }));
      setEvidences(prev => [...prev, ...newEvidences]);
    }
  };

  const router = useRouter();

  const actionWithData = async (formData: FormData) => {
    const newEvidences = evidences.filter(ev => ev.file || (ev.content && !initialEvidences.some(ie => ie.id === ev.id)));
    
    newEvidences.forEach((ev, i) => {
      formData.append(`evidence_type_${i}`, ev.type);
      if (ev.type === 'file' && ev.file) {
         formData.append(`evidence_file_${i}`, ev.file);
      } else if (ev.content) {
         formData.append(`evidence_content_${i}`, ev.content);
      }
    });

    formData.append('task_id', selectedTaskId || "");
    formData.append('evidence_count', newEvidences.length.toString());
    
    // Checkboxes are appended only if checked in standard form submission
    // But we append them explicitly to be safe and match the server expectation of "true"/"false"
    const isPrivate = (document.getElementById('is_private') as HTMLInputElement)?.checked;
    const isPaid = (document.getElementById('is_paid') as HTMLInputElement)?.checked;
    formData.append('is_private', isPrivate ? 'true' : 'false');
    formData.append('is_paid', isPaid ? 'true' : 'false');
    
    formData.append('deleted_evidence_ids', JSON.stringify(deletedEvidenceIds));
    
    if (isEditing) {
      const result = await updateActivity(activity.id, formData);
      if (result.success) {
        toast({ title: "Atividade atualizada!", description: "Suas alterações foram salvas." });
        router.push(`/projects/${projectId}`);
        router.refresh();
      } else {
        toast({ title: "Erro ao atualizar", description: result.error, variant: "destructive" });
      }
    } else {
      const result = await createActivity(formData);
      if (result.success) {
        toast({ title: "Atividade registrada!", description: "Sua produção foi documentada." });
      } else {
        toast({ title: "Erro ao criar", description: result.error, variant: "destructive" });
      }
    }
  };

  const handleAiExtract = async () => {
    if (!aiText.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await extractActivityPayload(aiText, new Date().toISOString());
      if (res.success && res.data) {
        if (res.data.description) setDescription(res.data.description);
        if (res.data.sprint) setSprint(res.data.sprint);
        if (res.data.ticket) setTicket(res.data.ticket);
        if (res.data.durationMinutes) setDuration(res.data.durationMinutes);
        if (res.data.startTime) setStartTime(res.data.startTime.slice(0, 16));
        if (res.data.endTime) setEndTime(res.data.endTime.slice(0, 16));
        
        toast({
          title: "Magia concluída! ✨",
          description: "Os campos foram preenchidos com base no seu texto. Revise antes de salvar.",
        });
        setAiText(""); 
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Card className="shadow-none border-0 bg-transparent text-left" onPaste={handlePaste}>
      <CardContent className="p-0 space-y-8">
        {!isEditing && (
          <div className="space-y-4 bg-primary/5 p-6 rounded-2xl border-2 border-primary/20">
            <div className="flex items-center gap-2 mb-1 text-primary">
              <Bot className="h-6 w-6" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Assistente IA</h3>
            </div>
            <p className="text-sm text-muted-foreground/80 leading-relaxed">Poupe tempo! Descreva o que você fez em linguagem natural. <br/><span className="text-[11px] font-medium italic opacity-70">Ex: "Trabalhei hoje na task UX-123 das 14h às 16h corrigindo o botão principal".</span></p>
            <Textarea
              placeholder="Descreva sua atividade aqui..."
              className="resize-none h-24 bg-background border-2 focus-visible:ring-primary rounded-xl p-4 transition-all"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              disabled={isAiLoading}
            />
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="secondary" 
                size="lg" 
                className="gap-3 rounded-xl font-bold shadow-sm active:scale-95 transition-all" 
                onClick={handleAiExtract}
                disabled={isAiLoading || !aiText.trim()}
              >
                {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 text-purple-500" />}
                MÁGICA IA
              </Button>
            </div>
          </div>
        )}
        
        <form action={actionWithData} className="space-y-8">
          <input type="hidden" name="project_id" value={projectId} />

          {/* Vínculo de Tarefa - SEÇÃO DESTAQUE */}
          {tasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="task_id" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Missão Vinculada</Label>
                {linkedTask && (
                   <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/20">
                     Relacionado ao Quadro Ágil
                   </Badge>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 items-start">
                  <select 
                    name="task_id" 
                    id="task_id"
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Nenhuma missão selecionada</option>
                    {tasks
                      .filter(t => isEditing || t.status !== 'done')
                      .map((task) => (
                        <option key={task.id} value={task.id}>
                          {task.name}
                        </option>
                      ))}
                  </select>

                  {linkedTask && (
                    <div className="p-3 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="text-[9px] font-black h-4 px-1">{linkedTask.status}</Badge>
                        <span className="text-xs font-bold truncate">{linkedTask.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{linkedTask.description || "Sem descrição disponível."}</p>
                    </div>
                  )}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-muted-foreground/40 tracking-[0.2em]">Detalhes da Atividade</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest opacity-60">O que você fez?</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Ex: Implementação da UI do Login" 
                    required 
                    className="h-14 border-2 focus-visible:ring-primary rounded-xl text-lg font-medium px-4" 
                  />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sprint" className="text-xs font-bold uppercase tracking-widest opacity-60">Ciclo / Sprint</Label>
                <Input id="sprint" name="sprint" value={sprint} onChange={(e) => setSprint(e.target.value)} placeholder="Ex: Sprint 12" className="h-12 border-2 rounded-xl focus-visible:ring-primary px-4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket" className="text-xs font-bold uppercase tracking-widest opacity-60">ID do Ticket / Card</Label>
                <Input id="ticket" name="ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="Ex: JIRA-404" className="h-12 border-2 rounded-xl focus-visible:ring-primary px-4" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase text-muted-foreground/40 tracking-[0.2em]">Registro de Tempo</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start_time" className="text-xs font-bold uppercase tracking-widest opacity-60">Horário de Início</Label>
                <Input 
                  id="start_time" 
                  name="start_time" 
                  type="datetime-local" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="h-12 border-2 rounded-xl focus-visible:ring-primary px-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time" className="text-xs font-bold uppercase tracking-widest opacity-60">Horário de Término</Label>
                <Input 
                  id="end_time" 
                  name="end_time" 
                  type="datetime-local" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="h-12 border-2 rounded-xl focus-visible:ring-primary px-4"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-xs font-bold uppercase tracking-widest opacity-60">Duração Total (Minutos)</Label>
              <Input 
                id="duration_minutes" 
                name="duration_minutes" 
                type="number" 
                min="0" 
                max="1440" 
                value={duration} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(e.target.value) || 0)}
                required
                className="h-12 border-2 rounded-xl focus-visible:ring-primary text-xl font-black text-primary px-4" 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <div className="flex items-center space-x-3 bg-green-500/5 p-4 rounded-2xl border-2 border-green-500/10 flex-1">
                <input 
                  type="checkbox" 
                  id="is_paid" 
                  name="is_paid" 
                  defaultChecked={activity?.isPaid || false}
                  className="w-6 h-6 accent-green-600 cursor-pointer rounded-lg" 
                />
                <Label htmlFor="is_paid" className="cursor-pointer font-black uppercase tracking-widest text-[11px] text-green-600 dark:text-green-400">
                  Marcar como JÁ PAGO
                </Label>
              </div>

              <div className="flex items-center space-x-3 bg-amber-500/5 p-4 rounded-2xl border-2 border-amber-500/10 flex-1">
                <input 
                  type="checkbox" 
                  id="is_private" 
                  name="is_private" 
                  defaultChecked={activity?.isPrivate || false}
                  className="w-6 h-6 accent-amber-600 cursor-pointer rounded-lg" 
                />
                <Label htmlFor="is_private" className="cursor-pointer font-black uppercase tracking-widest text-[11px] text-amber-600 dark:text-amber-400">
                  Privacidade (Freelancer Only)
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-muted-foreground/40 tracking-[0.2em]">Provas de Trabalho (Evidências)</h3>
              <div className="relative cursor-pointer text-xs flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-4 py-2.5 rounded-xl transition-all font-bold uppercase tracking-widest shadow-sm active:scale-95">
                <Camera className="h-4 w-4" />
                Upload de Arquivos
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
              </div>
            </div>
            
            <div className="p-10 rounded-2xl border-2 border-dashed border-border/60 text-center text-sm text-muted-foreground bg-muted/5 transition-all hover:bg-muted/10 group">
              <p className="font-bold text-lg text-foreground/80 group-hover:scale-105 transition-transform">Clique aqui e Cole (Ctrl + V)</p>
              <p className="mt-1 text-xs font-medium opacity-60">Imagens, links, commits ou textos para comprovação rápida.</p>
            </div>

            {evidences.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {evidences.map((ev) => {
                  const mediaUrl = ev.previewUrl || ev.content;
                  const isImage = (ev.type === 'image' || ev.type === 'gif') || (mediaUrl?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i));
                  const isVideo = ev.type === 'video' || (mediaUrl?.match(/\.(mp4|webm|mov|ogg)$/i));
                  const isMedia = isImage || isVideo || ev.file?.type.startsWith('image/') || ev.file?.type.startsWith('video/');

                  return (
                    <div key={ev.id} className="relative group rounded-2xl border-2 p-3 flex flex-col items-center justify-center min-h-[140px] overflow-hidden bg-background shadow-sm hover:shadow-md transition-all">
                      <Button 
                        type="button"
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removeEvidence(ev.id)}
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-all z-20 shadow-md transform translate-x-2 group-hover:translate-x-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      
                      {isMedia && mediaUrl ? (
                        isVideo ? (
                          <div 
                            className="absolute inset-0 w-full h-full bg-black cursor-pointer"
                            onClick={() => setPreviewItem({ url: mediaUrl, type: 'video' })}
                          >
                             <video src={mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
                             <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-[9px] font-black bg-black/60 text-white border-0 py-0.5 px-2">VIDEO</Badge>
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-6 h-6 text-white" />
                             </div>
                          </div>
                        ) : (
                          <div 
                            className="absolute inset-0 w-full h-full cursor-pointer"
                            onClick={() => setPreviewItem({ url: mediaUrl, type: 'image' })}
                          >
                             <img src={mediaUrl} alt="preview" className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
                             {(ev.type === 'gif' || ev.type === 'image' || isImage) && (
                               <div className="absolute top-2 left-2">
                                  <Badge variant="secondary" className="text-[9px] font-black bg-black/60 text-white border-0 py-0.5 px-2 uppercase">{ev.type === 'image' || isImage ? 'IMG' : 'GIF'}</Badge>
                               </div>
                             )}
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <Eye className="w-6 h-6 text-white" />
                             </div>
                          </div>
                        )
                      ) : ev.type === 'link' ? (
                        <>
                          <LinkIcon className="h-10 w-10 text-blue-500 mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                          <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-[9px] font-black bg-blue-500/10 text-blue-600 border-none py-0.5 px-2">LINK</Badge>
                          </div>
                        </>
                      ) : ev.type === 'commit' || (ev.type as string) === 'git_commit' || ev.type === 'observation' || ev.type === 'text' ? (
                        <>
                          {ev.type === 'commit' || (ev.type as string) === 'git_commit' ? <GitCommit className="h-10 w-10 text-purple-500 mb-2 opacity-80" /> : <FileText className="h-10 w-10 text-amber-500 mb-2 opacity-80" />}
                          <div className="absolute top-2 left-2">
                              <Badge variant="secondary" className="text-[9px] font-black bg-primary/10 text-primary border-none py-0.5 px-2 uppercase">{ev.type}</Badge>
                          </div>
                        </>
                      ) : (
                        <FileIcon className="h-10 w-10 text-muted-foreground mb-2 opacity-80" />
                      )}
                      
                      <span className="text-[10px] font-bold truncate w-[85%] text-center mt-auto z-10 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg relative border border-border/50 shadow-sm">
                        {ev.type === 'file' ? ev.file?.name : ((ev.content?.length || 0) > 20 ? ev.content?.substring(0, 20) + '...' : ev.content) || (ev.type === 'link' ? 'Link Proof' : 'Observation')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Fullscreen Preview Modal */}
            {previewItem && (
              <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 pointer-events-auto"
                onClick={() => setPreviewItem(null)}
              >
                <button 
                  className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-all z-[110]"
                  onClick={(e) => { e.stopPropagation(); setPreviewItem(null); }}
                >
                  <X className="w-8 h-8 text-white" />
                </button>
                
                <div className="relative max-w-7xl max-h-[90vh] w-full p-4 flex items-center justify-center animate-in zoom-in-95 duration-500">
                  {previewItem.type === 'video' ? (
                    <video 
                      src={previewItem.url} 
                      controls 
                      autoPlay 
                      className="max-w-full max-h-[85vh] rounded-3xl shadow-2xl border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img 
                      src={previewItem.url} 
                      alt="Fullscreen preview" 
                      className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="pt-8 border-t-2 border-dashed mt-10 flex justify-end gap-6">
            <SubmitButton 
              label={isEditing ? "Atualizar Atividade" : "Log Activity & Evidences"} 
              className="h-14 px-10 rounded-2xl font-black uppercase tracking-tighter text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
