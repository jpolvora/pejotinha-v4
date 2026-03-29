"use client";

import { useTransition, useState } from "react";
import { addEvidence, deleteEvidence } from "@/actions/activities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Link as LinkIcon, GitCommit, FileText, Upload, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EvidenceManager({ activityId, projectId, initialEvidences }: { activityId: string, projectId: string, initialEvidences: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [type, setType] = useState<'file' | 'link' | 'commit' | 'observation'>('link');
  const [content, setContent] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("type", type);
    
    if (type === 'file') {
        const fileInput = (e.target as HTMLFormElement).elements.namedItem('file') as HTMLInputElement;
        if (fileInput.files?.[0]) formData.append("file", fileInput.files[0]);
    } else {
        formData.append("content", content);
    }

    startTransition(async () => {
        try {
            await addEvidence(activityId, projectId, formData);
            setShowAdd(false);
            setContent("");
            toast.success("Evidência adicionada com sucesso!");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao adicionar evidência.");
        }
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
        try {
            await deleteEvidence(id, activityId, projectId);
            toast.success("Evidência removida.");
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Erro ao excluir evidência.");
        }
    });
  };

  return (
    <div className="space-y-4">
      {initialEvidences.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
            {initialEvidences.map(ev => (
                <div key={ev.id} className="group relative flex items-center gap-2 px-3 py-1.5 bg-muted/40 hover:bg-muted/60 rounded-lg border text-xs transition-all">
                    {ev.evidenceType === 'file' ? <Upload className="w-3.5 h-3.5 text-blue-500" /> :
                     ev.evidenceType === 'link' ? <LinkIcon className="w-3.5 h-3.5 text-emerald-500" /> :
                     (ev.evidenceType === 'commit' || ev.evidenceType === 'git_commit') ? <GitCommit className="w-3.5 h-3.5 text-purple-500" /> :
                     <FileText className="w-3.5 h-3.5 text-amber-500" />}
                    
                    <span className="max-w-[200px] truncate font-medium">
                        {ev.evidenceType === 'file' ? 'Arquivo Anexo' : ev.content}
                    </span>

                    <button 
                        onClick={() => handleDelete(ev.id)}
                        disabled={isPending}
                        className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:bg-destructive/10 rounded transition-opacity disabled:opacity-50"
                        title="Remover evidência"
                    >
                        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                </div>
            ))}
        </div>
      )}

      {showAdd ? (
        <div className="p-4 border border-dashed rounded-xl bg-muted/20 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Nova Evidência</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAdd(false)}>
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                    { id: 'file', label: 'Arquivo', icon: Upload },
                    { id: 'link', label: 'Link URL', icon: LinkIcon },
                    { id: 'commit', label: 'Commit', icon: GitCommit },
                    { id: 'observation', label: 'Nota', icon: FileText }
                ].map(item => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setType(item.id as any)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-tight transition-all border ${
                            type === item.id 
                            ? 'bg-primary text-primary-foreground border-primary scale-105 shadow-md shadow-primary/20' 
                            : 'bg-background hover:bg-muted border-muted-foreground/10 opacity-70'
                        }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleAdd} className="space-y-3">
                {type === 'file' ? (
                    <div className="space-y-1">
                        <Input type="file" name="file" className="bg-background h-10 text-xs cursor-pointer" required />
                        <p className="text-[10px] text-muted-foreground px-1 italic">Imagens, vídeos ou logs.</p>
                    </div>
                ) : (
                    <Input 
                        placeholder={type === 'link' ? "https://github.com/..." : type === 'commit' ? "Hash do commit (e.g. abc123f)" : "Descreva sua observação técnico/manual..."}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="bg-background h-10 text-xs"
                        required
                    />
                )}
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={isPending} className="font-bold uppercase text-[10px] tracking-widest px-4">
                        {isPending ? "Salvando..." : "Confirmar"}
                    </Button>
                </div>
            </form>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="w-full border-dashed text-[10px] font-black uppercase tracking-widest h-9 bg-background/50 hover:bg-background transition-all" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Gerenciar Evidências
        </Button>
      )}
    </div>
  );
}
