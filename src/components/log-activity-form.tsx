"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Link as LinkIcon, FileText, Camera, File as FileIcon, Sparkles, Loader2, Bot } from "lucide-react";
import { createActivity } from "@/actions/activities";
import { extractActivityPayload } from "@/actions/ai";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type Evidence = {
  id: string;
  type: 'file' | 'link' | 'text' | 'observation' | 'commit';
  file?: File;
  content?: string;
  previewUrl?: string;
};

export function LogActivityForm({ projectId, tasks = [] }: { projectId: string, tasks?: any[] }) {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [sprint, setSprint] = useState("");
  const [ticket, setTicket] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState(0);
  const [evidences, setEvidences] = useState<Evidence[]>([]);

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

  // Handle Ctrl+V to paste images/links/text
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setEvidences(prev => [...prev, { id: Date.now().toString() + i, type: 'file', file, previewUrl }]);
            }
        } else if (item.type === 'text/plain') {
            item.getAsString(text => {
                const id = Date.now().toString() + i;
                if (text.startsWith('http')) {
                    setEvidences(prev => [...prev, { id, type: 'link', content: text }]);
                } else if (/^[0-9a-f]{7,40}$/i.test(text)) {
                    setEvidences(prev => [...prev, { id, type: 'commit', content: text }]);
                } else {
                    setEvidences(prev => [...prev, { id, type: 'text', content: text }]);
                }
            });
        }
    }
  };

  const removeEvidence = (id: string) => {
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

  const actionWithData = async (formData: FormData) => {
    // Append evidence data payload
    evidences.forEach((ev, i) => {
      formData.append(`evidence_type_${i}`, ev.type);
      if (ev.type === 'file' && ev.file) {
         formData.append(`evidence_file_${i}`, ev.file);
      } else if (ev.content) {
         formData.append(`evidence_content_${i}`, ev.content);
      }
    });
    formData.append('task_id', selectedTaskId);
    formData.append('evidence_count', evidences.length.toString());
    
    await createActivity(formData);
    // Redirect is handled inside createActivity action
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
        setAiText(""); // Limpa o texto após o sucesso
      } else {
        const errorMsg = (res as any).error || "A IA não conseguiu processar sua atividade.";
        toast({
          title: "Erro na extração",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro de Conexão",
        description: e.message || "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Card className="shadow-none border-0 bg-transparent" onPaste={handlePaste}>
      <CardContent className="p-0">
        <form action={actionWithData} className="space-y-6">
          <input type="hidden" name="project_id" value={projectId} />

          <div className="space-y-3 bg-muted/30 p-4 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-1 text-primary">
              <Bot className="h-5 w-5" />
              <h3 className="font-semibold text-sm uppercase tracking-wider">Assistente IA</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Descreva o que você fez em linguagem natural e deixe a IA preencher o formulário para você. Ex: "Trabalhei hoje na task UX-123 das 14h às 16h corrigindo o botão principal".</p>
            <Textarea
              placeholder="Descreva sua atividade aqui..."
              className="resize-none h-20 bg-background"
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              disabled={isAiLoading}
            />
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                className="gap-2" 
                onClick={handleAiExtract}
                disabled={isAiLoading || !aiText.trim()}
              >
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-purple-500" />}
                Extrair Dados
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Basic Details</h3>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="description">Task Description</Label>
                  <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Implemented login UI" required className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md" />
                </div>
                
                {tasks.length > 0 && (
                  <div className="w-full md:w-1/3 space-y-2">
                    <Label htmlFor="task_id">Vincular a Tarefa (Opcional)</Label>
                    <select 
                      name="task_id" 
                      id="task_id"
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="flex h-12 w-full rounded-md border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    >
                      <option value="">Nenhuma</option>
                      {tasks
                        .filter(t => t.status !== 'done')
                        .map((task) => (
                          <option key={task.id} value={task.id}>
                            {task.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sprint">Sprint Number</Label>
                <Input id="sprint" name="sprint" value={sprint} onChange={(e) => setSprint(e.target.value)} placeholder="e.g. Sprint 12" className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket">Ticket / Card</Label>
                <Input id="ticket" name="ticket" value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="e.g. JIRA-404" className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Time Logging (Retroactive)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input 
                  id="start_time" 
                  name="start_time" 
                  type="datetime-local" 
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input 
                  id="end_time" 
                  name="end_time" 
                  type="datetime-local" 
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (Minutes)</Label>
              <Input 
                id="duration_minutes" 
                name="duration_minutes" 
                type="number" 
                min="0" 
                max="1440" 
                value={duration} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDuration(parseInt(e.target.value) || 0)}
                required
                className="h-12 border-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all rounded-md" 
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="is_paid" 
                name="is_paid" 
                value="true" 
                className="w-5 h-5 accent-primary cursor-pointer rounded border-2 border-primary" 
              />
              <Label htmlFor="is_paid" className="cursor-pointer font-bold uppercase tracking-widest text-[11px] text-green-600 dark:text-green-400">
                Mark as Paid (JÁ FOI PAGO)
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Evidences (Proof of Work)</h3>
              <div className="relative cursor-pointer text-xs flex items-center gap-1 bg-secondary hover:bg-secondary/80 px-3 py-2 rounded-md transition-colors font-medium">
                <Camera className="h-4 w-4" />
                Upload files
                <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileSelect} />
              </div>
            </div>
            <div className="p-8 rounded-lg border-2 border-dashed border-border/60 text-center text-sm text-muted-foreground bg-muted/10 transition-colors hover:bg-muted/30">
              <p className="font-medium">Paste (Ctrl+V) anywhere here</p>
              <p className="mt-1 text-xs">Images, links, or text to add as evidence.</p>
            </div>

            {evidences.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {evidences.map((ev) => (
                  <div key={ev.id} className="relative group rounded-md border-2 p-2 flex flex-col items-center justify-center min-h-[120px] overflow-hidden bg-background">
                    <Button 
                      type="button"
                      variant="destructive" 
                      size="icon" 
                      onClick={() => removeEvidence(ev.id)}
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    {ev.type === 'file' && ev.previewUrl ? (
                      ev.file?.type.startsWith('video/') ? (
                        <video src={ev.previewUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      ) : (
                        <img src={ev.previewUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      )
                    ) : ev.type === 'file' ? (
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    ) : ev.type === 'link' ? (
                      <LinkIcon className="h-8 w-8 text-blue-500" />
                    ) : (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    )}
                    
                    <span className="text-xs truncate w-full flex text-center justify-center mt-2 z-10 bg-background/90 px-2 py-1 rounded relative font-medium shadow-sm">
                      {ev.type === 'file' ? ev.file?.name : ev.type === 'link' ? 'Link Proof' : ev.type === 'commit' ? 'Git Commit Proof' : 'Observation/Note'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t mt-8 flex justify-end gap-4">
            <SubmitButton label="Log Activity & Evidences" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
