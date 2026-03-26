import { getReportsData } from "@/actions/reports";
import { ReportsCharts } from "./reports-charts"; 
import { MonthlyDetailedReport } from "@/components/detailed-report";

export default async function ReportsPage(props: { searchParams: Promise<{ projectId?: string }> }) {
  const data = await getReportsData();
  const { projectId } = await props.searchParams;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground/90 uppercase">Advanced Intelligence</h1>
          <p className="text-muted-foreground mt-1 font-medium">Visualize seu desempenho e detalhe atividades por período.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <section>
          <ReportsCharts 
            timePerProjectChart={data.timePerProjectChart} 
            dailyChartData={data.dailyChartData} 
            rawData={data.timePerProject} 
          />
        </section>

        <section className="pt-8 border-t border-dashed">
          <div className="mb-6">
             <h2 className="text-2xl font-bold tracking-tight">Detalhamento por Período</h2>
             <p className="text-sm text-muted-foreground">Extraia logs detalhados para comprovação de trabalho ou faturamento.</p>
          </div>
          <MonthlyDetailedReport projectId={projectId} />
        </section>
      </div>
    </div>
  );
}
