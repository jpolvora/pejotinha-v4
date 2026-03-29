"use client";

import { FileText, GitCommit, Link as LinkIcon, Plus, ExternalLink, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Evidence {
  id: string;
  evidenceType: string;
  fileUrl?: string | null;
  content?: string | null;
}

interface EvidenceGalleryProps {
  evidences: Evidence[];
}

export function EvidenceGallery({ evidences }: EvidenceGalleryProps) {
  if (!evidences || evidences.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
          Galeria de Comprovação
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-muted/50 to-transparent" />
      </div>

      <div className="flex flex-wrap gap-4">
        {evidences.map((ev) => {
          const isImage = ev.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i);
          const isVideo = ev.fileUrl?.match(/\.(mp4|webm)$/i);
          const isMedia = isImage || isVideo;
          const isCommit = ev.evidenceType === 'commit' || ev.evidenceType === 'git_commit' || (ev.evidenceType === 'text' && ev.content?.includes('Commit'));
          
          if (ev.evidenceType === 'file' && isMedia) {
            return (
              <div key={ev.id} className="relative group w-44">
                <div className="aspect-video relative rounded-2xl overflow-hidden border-2 border-muted/50 bg-muted/20 hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1">
                  <a href={ev.fileUrl ?? undefined} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                    {isVideo ? (
                      <div className="relative w-full h-full">
                         <video src={ev.fileUrl ?? undefined} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-8 h-8 text-white/50 fill-white/20" />
                         </div>
                      </div>
                    ) : (
                      <img src={ev.fileUrl ?? undefined} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500 backdrop-blur-[2px]">
                      <div className="bg-white/10 p-2 rounded-full border border-white/20 backdrop-blur-md">
                        <ExternalLink className="text-white w-5 h-5" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="mt-2 px-1">
                   <div className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest truncate">
                      {isVideo ? "Video Proof" : "Image Proof"}
                   </div>
                </div>
              </div>
            );
          }

          return (
            <div key={ev.id} className="group flex flex-col gap-2 w-44">
              <a 
                href={ev.evidenceType === 'file' ? ev.fileUrl ?? undefined : (ev.evidenceType === 'link' ? ev.content ?? undefined : undefined)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={cn(
                  "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-500 aspect-video",
                  isCommit 
                    ? "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/50 hover:bg-purple-500/10" 
                    : "bg-muted/10 border-muted/30 hover:border-primary/40 hover:bg-muted/30",
                  (ev.evidenceType === 'observation' || (ev.evidenceType === 'text' && !ev.content?.startsWith('http'))) && "cursor-default"
                )}
              >
                {ev.evidenceType === 'file' ? <FileText className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" /> :
                 ev.evidenceType === 'link' ? <LinkIcon className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" /> :
                 isCommit ? <GitCommit className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" /> :
                 <FileText className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform" />}
                
                <span className="text-[10px] font-bold text-center mt-3 line-clamp-2 max-w-full px-2 opacity-70 group-hover:opacity-100 transition-opacity">
                  {ev.evidenceType === 'file' ? 'Arquivo Anexo' : ev.content}
                </span>

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                </div>
              </a>
              <div className="px-1">
                 <div className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-widest">
                    {ev.evidenceType === 'link' ? 'Resource' : isCommit ? 'Commit' : 'Doc/Note'}
                 </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
