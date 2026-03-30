import { ProductivityChart } from "@/components/dashboard/productivity-chart"
import { Timer, Briefcase, FileText, CheckCircle, Activity, CalendarDays, Lock, Users, GitBranch, Sparkles, ExternalLink, Image } from "lucide-react"
import { getDashboardStats, getIntegratedTimeline } from "@/actions/dashboard"
import { formatDateTime, formatDuration } from "@/lib/locale"
import { Badge } from "@/components/ui/badge"

import { Link } from "@/i18n/routing"
import { OnboardingBanner } from "@/components/dashboard/onboarding-banner"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage() {
  const t = await getTranslations('Dashboard')
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

  const showOnboarding = safeStats.activeClients === 0;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">{t('welcomeBack')}</p>
      </div>

      {showOnboarding && <OnboardingBanner />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: t("totalHours"), icon: Timer, value: formatDuration(safeStats.totalMinutes), color: "text-blue-500", href: "/timeline" },
          { title: t("activeProjects"), icon: Briefcase, value: safeStats.activeProjects.toString(), color: "text-emerald-500", href: "/projects" },
          { title: t("activeClients"), icon: Users, value: safeStats.activeClients.toString(), color: "text-violet-500", href: "/clients" },
          { title: t("evidencesCount"), icon: FileText, value: safeStats.evidencesUploaded.toString(), color: "text-amber-500", href: "/timeline" },
        ].map((stat, i) => (
          <Link 
            key={i} 
            href={stat.href as any}
            className="rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-lg transition-all hover:bg-accent/10 cursor-pointer relative overflow-hidden group border-muted/50 block"
          >
            <div className={`absolute -top-6 -right-6 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
               <stat.icon className="h-24 w-24" />
            </div>
            <div className="p-6 pb-2 flex flex-row items-center justify-between space-y-0 text-left">
               <div className={`p-2 rounded-lg bg-muted/50 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <h3 className="tracking-tight text-xs font-bold uppercase opacity-60">{stat.title}</h3>
            </div>
            <div className="p-6 pt-0 mt-1">
              <div className="text-3xl font-black tracking-tighter text-left">{stat.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 rounded-2xl border bg-card/40 backdrop-blur-md shadow-sm p-6 border-muted/50 min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-xl tracking-tight">{t('productivityAnalysis')}</h3>
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-primary/20">{t('last7days')}</Badge>
          </div>
          <ProductivityChart data={safeStats.weeklyChartData} />
        </div>
        
        <div className="rounded-2xl border bg-card/40 backdrop-blur-md shadow-sm flex flex-col h-[600px] border-muted/50 overflow-hidden">
          <div className="p-6 pb-4 border-b border-muted/50 bg-accent/5">
            <h3 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {t('timelinePro')}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 font-medium italic">{t('realTimeTracking')}</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {timeline.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-40">
                <Activity className="w-12 h-12 mb-2" />
                <p className="text-sm font-medium">{t('absoluteSilence')}</p>
                <p className="text-xs">{t('logActivityMagic')}</p>
               </div>
            ) : (
                <div className="relative space-y-10">
                  <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/50 via-muted/50 to-transparent" />
                  
                  {timeline.map((item, idx) => {
                    const isPersonal = item.type === "personal";
                    const isAnon = item.type === "personal_anonymous";
                    const isGit = (item as any).source === 'git';
                    const isIA = (item as any).source === 'ia' || (item as any).source === 'magic';
                    
                    let EventIcon = Activity;
                    let dotColor = "bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]";
                    let accentColor = "text-primary";
                    let bgColor = "bg-primary/5";

                    if (isAnon) {
                      EventIcon = Lock;
                      dotColor = "bg-muted shadow-none";
                      accentColor = "text-muted-foreground";
                      bgColor = "bg-muted/10";
                    } else if (isPersonal) {
                      EventIcon = CalendarDays;
                      dotColor = "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]";
                      accentColor = "text-orange-600";
                      bgColor = "bg-orange-500/5";
                    } else if (isGit) {
                      EventIcon = GitBranch;
                      dotColor = "bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]";
                      accentColor = "text-indigo-600";
                      bgColor = "bg-indigo-600/5";
                    } else if (isIA) {
                      EventIcon = Sparkles;
                      dotColor = "bg-fuchsia-600 shadow-[0_0_8px_rgba(192,38,211,0.5)]";
                      accentColor = "text-fuchsia-600";
                      bgColor = "bg-fuchsia-600/5";
                    }
                    
                    return (
                      <div key={`${item.type}-${item.id}-${idx}`} className="relative pl-10 group">
                        {/* Dot */}
                        <div className={`absolute left-0 top-1 h-7 w-7 rounded-full border-4 border-background ${dotColor} flex items-center justify-center z-10 group-hover:scale-110 transition-transform`}>
                          <EventIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                              {item.startTime ? formatDateTime(item.startTime) : '—'}
                            </span>
                            {(item as any).projectSlug && (
                               <Badge variant="secondary" className="text-[9px] h-4 font-mono px-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                {(item as any).projectSlug}
                               </Badge>
                            )}
                          </div>
                          
                          <div className={`p-4 rounded-xl border border-muted/50 group-hover:border-primary/20 transition-all ${bgColor}/30 group-hover:shadow-md`}>
                            <h4 className={`text-sm font-bold leading-tight ${isAnon ? 'text-muted-foreground italic line-through' : ''}`}>
                              {item.title}
                            </h4>
                            
                            <div className="mt-2 text-xs text-muted-foreground font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                              {item.description}
                            </div>

                            <div className="flex items-center gap-4 mt-3 pt-2 border-t border-muted/20">
                              {item.durationMinutes && (
                                <div className={`flex items-center gap-1.5 text-[10px] font-bold ${accentColor} opacity-70`}>
                                  <Timer className="w-3 h-3" />
                                  {formatDuration(item.durationMinutes)}
                                </div>
                              )}
                              
                              {(item as any).evidenceCount > 0 && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                                  <Image className="w-3 h-4" />
                                  {(item as any).evidenceCount} {(item as any).evidenceCount === 1 ? t('evidence') : t('evidences')}
                                </div>
                              )}

                              {isGit && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 opacity-70">
                                  <ExternalLink className="w-3 h-3" />
                                  {t('gitCommit')}
                                </div>
                              )}
                            </div>
                          </div>
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
