"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ReportsCharts({
  timePerProjectChart,
  dailyChartData,
  rawData
}: {
  timePerProjectChart: any[];
  dailyChartData: any[];
  rawData: any[];
}) {
  
  const generatePDF = () => {
    const doc = new jsPDF()
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("Relatório Geral de Horas e Projetos", 14, 22)
    
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 32)
    
    const tableData = rawData.map(p => [
      p.name,
      p.customer,
      `${(p.totalMinutes / 60).toFixed(1)}h`,
      `R$ ${p.amount.toFixed(2)}`
    ])

    autoTable(doc, {
      startY: 40,
      head: [["Projeto", "Cliente / Time", "Horas Totais", "Faturamento Estimado"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
    })

    const totalMoney = rawData.reduce((acc, p) => acc + p.amount, 0)
    const totalTime = rawData.reduce((acc, p) => acc + p.totalMinutes, 0)
    
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text(`Total Acumulado de Horas: ${(totalTime / 60).toFixed(1)}h`, 14, finalY + 15)
    doc.text(`Faturamento Total Previsto: R$ ${totalMoney.toFixed(2)}`, 14, finalY + 25)

    doc.save("relatorio_horas_pejotinha.pdf")
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={generatePDF} className="gap-2 shadow-sm rounded-full">
          <Download className="w-4 h-4" />
          Exportar PDF Consolidado
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col h-[400px]">
          <h3 className="font-semibold text-lg tracking-tight mb-6">Time Distribution per Project</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timePerProjectChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="totalHours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm p-6 flex flex-col h-[400px]">
          <h3 className="font-semibold text-lg tracking-tight mb-6">Productivity Trend (Last 30 Days)</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: "3 3" }} contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                <Line type="monotone" dataKey="hours" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
