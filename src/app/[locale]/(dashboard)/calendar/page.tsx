import { getPersonalEvents } from "@/actions/personal_events";
import { PersonalEventModal } from "./personal-event-modal";
import { Calendar as CalendarIcon, Clock, FileText } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function CalendarPage() {
  const t = await getTranslations('Calendar');
  const events = await getPersonalEvents();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <PersonalEventModal />
      </div>

      <div className="grid gap-4 mt-8">
        {events.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-xl bg-muted/10 text-muted-foreground flex flex-col items-center">
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="font-medium text-foreground">{t('noEvents')}</p>
            <p className="text-sm mt-1">{t('startTracking')}</p>
          </div>
        ) : (
          events.map((event: any) => (
            <div key={event.id} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
              <div>
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {event.title}
                </h3>
                {event.description && <p className="text-muted-foreground text-sm mt-1.5 ml-4">{event.description}</p>}
                
                <div className="flex items-center gap-4 mt-4 ml-4 text-sm font-medium text-muted-foreground bg-muted/40 w-fit px-3 py-1.5 rounded-md">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary/70" />
                    {new Date(event.startTime).toLocaleDateString()} {t('at')} {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" - "}
                    {new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              {event.proofUrl && (
                <a href={event.proofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm bg-accent/40 hover:bg-accent px-4 py-2 rounded-md transition-colors text-primary border border-transparent hover:border-border">
                  <FileText className="w-4 h-4" />
                  {t('viewProof')}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
