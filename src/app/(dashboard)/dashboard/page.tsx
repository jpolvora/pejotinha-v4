import { ProductivityChart } from "@/components/dashboard/productivity-chart"
import { Timer, Briefcase, FileText, CheckCircle, Activity, CalendarDays, Lock, Users } from "lucide-react"
import { getDashboardStats, getIntegratedTimeline } from "@/actions/dashboard"
import { formatDateTime, formatDuration } from "@/lib/locale"

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const timeline = await getIntegratedTimeline();

  const safeStats = stats || {
    totalMinutes: 0,
    totalHoursStr: "0h 0m",
    activeProjects: 0,
    activeClients: 0,
    pendingApprovals: 0,
    evidencesUploaded: 0,
    weeklyChartData: [],
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Bem-vindo de volta! Aqui está seu resumo de horas trabalhadas e timeline.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total de Horas", icon: Timer, value: formatDuration(safeStats.totalMinutes) },
          { title: "Projetos Ativos", icon: Briefcase, value: safeStats.activeProjects.toString() },
          { title: "Clientes Ativos", icon: Users, value: safeStats.activeClients.toString() },
          { title: "Evidências Enviadas", icon: FileText, value: safeStats.evidencesUploaded.toString() },
        ].map((stat, i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:bg-accent/5 cursor-default relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <stat.icon className="h-16 w-16" />
            </div>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium opacity-80">{stat.title}</h3>
            </div>
            <div className="p-6 pt-0 mt-2">
              <div className="text-3xl font-bold">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold text-lg tracking-tight mb-4">Produtividade (Últimos 7 Dias)</h3>
          <ProductivityChart data={safeStats.weeklyChartData} />
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-[500px]">
          <div className="p-6 pb-4 border-b">
            <h3 className="font-semibold text-lg tracking-tight flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Timeline Integrada
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Atividades e eventos recentes combinados</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {timeline.length === 0 ? (
               <div className="text-sm text-center text-muted-foreground mt-10">Nenhum evento recente encontrado.</div>
            ) : (
                <div className="relative border-l-2 border-muted ml-3 space-y-8 pb-4">
                  {timeline.map((item, idx) => {
                    const isPersonal = item.type === "personal";
                    const isAnon = item.type === "personal_anonymous";
                    const Icon = isAnon ? Lock : isPersonal ? CalendarDays : Activity;
                    const dotColor = isAnon ? "bg-muted" : isPersonal ? "bg-orange-500" : "bg-primary";
                    
                    return (
                      <div key={`${item.type}-${item.id}-${idx}`} className="relative pl-6">
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${dotColor}`} />
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-muted-foreground font-medium">
                            {item.startTime ? formatDateTime(item.startTime) : '—'}
                          </span>
                          <h4 className={`text-sm font-semibold flex items-center gap-2 ${isAnon ? 'text-muted-foreground italic' : ''}`}>
                            {item.title}
                            {isAnon && <Lock className="w-3 h-3" />}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          {item.durationMinutes && (
                            <span className="text-xs text-primary/80 font-medium">
                              ⏱ {formatDuration(item.durationMinutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
