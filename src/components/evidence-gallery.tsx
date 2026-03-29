"use client";

import { FileText, GitCommit, Link as LinkIcon, ExternalLink, Play, Download, Eye, Image as ImageIcon, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

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
  const [previewItem, setPreviewItem] = useState<{ url: string, type: 'image' | 'video' } | null>(null);

  if (!evidences || evidences.length === 0) return null;

  return (
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 border border-primary/20">
             <ImageIcon className="w-3 h-3 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Work Evidence Gallery
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-border/60 via-border/20 to-transparent" />
        </div>

        <div className="flex flex-wrap gap-5">
          {evidences.map((ev) => {
            const isImage = ev.fileUrl?.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);
            const isVideo = ev.fileUrl?.match(/\.(mp4|webm|mov|ogg)$/i);
            const isMedia = (ev.evidenceType === 'file' && (isImage || isVideo)) || 
                          ev.evidenceType === 'image' || 
                          ev.evidenceType === 'gif' || 
                          ev.evidenceType === 'video';
            const isCommit = ev.evidenceType === 'commit' || ev.evidenceType === 'git_commit' || (ev.evidenceType === 'text' && ev.content?.includes('Commit'));
            
            if (isMedia) {
              return (
                <div key={ev.id} className="relative group w-48 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div 
                    className="aspect-video relative rounded-2xl overflow-hidden border-2 border-border/40 bg-muted/30 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 mt-1 cursor-pointer"
                    onClick={() => setPreviewItem({ url: ev.fileUrl!, type: isVideo ? 'video' : 'image' })}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full">
                         <video src={ev.fileUrl ?? undefined} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
                              <Play className="w-6 h-6 text-white fill-white/40" />
                            </div>
                         </div>
                      </div>
                    ) : (
                      <img src={ev.fileUrl ?? undefined} alt="Evidence" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex flex-col justify-end p-4">
                      <div className="flex gap-2 justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <button className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-all active:scale-95">
                          <Eye className="text-white w-5 h-5" />
                        </button>
                        
                        <a href={ev.fileUrl ?? undefined} download target="_blank" onClick={(e) => e.stopPropagation()} className="bg-primary/20 hover:bg-primary/40 p-2.5 rounded-xl border border-primary/30 backdrop-blur-md transition-all active:scale-95">
                          <Download className="text-white w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 px-2 flex justify-between items-center">
                     <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest truncate">
                        {isVideo ? "Video Clip" : "Screen Proof"}
                     </span>
                     <Badge variant="outline" className="text-[8px] h-4 px-1 border-primary/20 bg-primary/5 text-primary">FILE</Badge>
                  </div>
                </div>
              );
            }

            return (
              <div key={ev.id} className="group relative flex flex-col gap-2 w-48 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
                <div 
                  className={cn(
                    "relative flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-500 aspect-video shadow-sm hover:shadow-xl hover:-translate-y-1 mt-1",
                    isCommit 
                      ? "bg-purple-500/5 border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/10" 
                      : (ev.evidenceType === 'link' 
                          ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10"
                          : "bg-muted/10 border-border/40 hover:border-primary/40 hover:bg-muted/20")
                  )}
                >
                  {ev.evidenceType === 'file' ? <FileText className="w-8 h-8 text-primary/80 group-hover:scale-110 group-hover:text-primary transition-all duration-500" /> :
                   ev.evidenceType === 'link' ? <LinkIcon className="w-8 h-8 text-emerald-500/80 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500" /> :
                   isCommit ? <GitCommit className="w-8 h-8 text-purple-500/80 group-hover:scale-110 group-hover:text-purple-500 transition-all duration-500" /> :
                   <FileText className="w-8 h-8 text-amber-500/80 group-hover:scale-110 group-hover:text-amber-500 transition-all duration-500" />}
                  
                  <span className="text-[10px] font-black text-center mt-3 line-clamp-2 max-w-full px-2 opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
                    {ev.evidenceType === 'file' ? 'Arquivo Anexo' : (ev.content?.length ?? 0 > 30 ? ev.content?.substring(0, 30) + '...' : ev.content)}
                  </span>

                  <div className="absolute inset-0 bg-background/20 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
                     <div className="flex gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        { (ev.evidenceType === 'link' || (ev.evidenceType === 'file' && !isMedia)) && (
                            <a href={ev.fileUrl ?? ev.content ?? undefined} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-xl border border-border shadow-lg hover:bg-muted active:scale-90 transition-all">
                              <ExternalLink className="text-foreground w-4 h-4" />
                            </a>
                        )}
                        { ev.evidenceType === 'file' && (
                            <a href={ev.fileUrl ?? undefined} download target="_blank" className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg hover:bg-primary/90 active:scale-90 transition-all">
                              <Download className="w-4 h-4" />
                            </a>
                        )}
                     </div>
                  </div>
                </div>
                <div className="px-2 flex justify-between items-center">
                   <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-[0.15em]">
                      {ev.evidenceType === 'link' ? 'Global Resource' : isCommit ? 'Source Control' : 'Context Note'}
                   </span>
                   <Badge variant="secondary" className="text-[8px] h-4 px-1 font-black opacity-60 grayscale group-hover:grayscale-0 transition-all">{ev.evidenceType === 'link' ? 'URL' : isCommit ? 'GIT' : 'DOC'}</Badge>
                </div>
              </div>
            );
          })}
        </div>

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
  );
}
