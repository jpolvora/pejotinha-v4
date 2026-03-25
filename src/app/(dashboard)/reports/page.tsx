import { getReportsData } from "@/actions/reports";
import { ReportsCharts } from "./reports-charts"; 

export default async function ReportsPage() {
  const data = await getReportsData();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Reports</h1>
          <p className="text-muted-foreground mt-1">Visualize your time distribution and export total summaries by project.</p>
        </div>
      </div>

      <ReportsCharts 
        timePerProjectChart={data.timePerProjectChart} 
        dailyChartData={data.dailyChartData} 
        rawData={data.timePerProject} 
      />
    </div>
  );
}
