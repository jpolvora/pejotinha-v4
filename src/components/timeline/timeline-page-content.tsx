"use client";

import { useState, useEffect } from "react";
import { TimelineFilters } from "@/components/timeline/timeline-filters";
import { TimelineMainView, TimelineItem } from "@/components/timeline/timeline-main-view";
import { getFilteredTimeline, TimelineFilterOptions } from "@/actions/timeline";
import { Activity, Clock, CalendarDays, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TimelinePageProps {
  projects: { id: string, name: string }[];
}

export default function TimelinePageContent({ projects }: TimelinePageProps) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TimelineFilterOptions>({ visibility: "all" });

  async function loadTimeline() {
    setLoading(true);
    try {
      const result = await getFilteredTimeline(filters);
      if (result.success) {
        setItems(result.data as TimelineItem[]);
      }
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimeline();
  }, [filters]);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Clock className="w-6 h-6" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent uppercase">Timeline Smart</h1>
          </div>
          <p className="text-muted-foreground text-sm font-medium ml-1">Visualize cada movimento, do código ao café.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <Badge variant="outline" className="px-3 py-1 bg-background/50 border-muted/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
             <Activity className="w-3 h-3 mr-2 text-primary" /> {items.length} Eventos Sincronizados
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <section>
          <TimelineFilters projects={projects} onFilter={(f) => setFilters(f as TimelineFilterOptions)} />
        </section>

        <section className="bg-card/20 backdrop-blur-md rounded-3xl p-8 border border-muted/50 shadow-inner">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
               <CalendarDays className="w-6 h-6 text-primary" />
               Fluxo de Atividades
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-full">
               <Filter className="w-3 h-3" /> Ordem Cronológica
            </div>
          </div>
          
          <TimelineMainView items={items} loading={loading} />
        </section>
      </div>
    </div>
  );
}
