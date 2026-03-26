"use client";

import { useState, useEffect } from "react";
import { getDetailedProjectReport } from "@/actions/reports";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/locale";
import { Calendar, Filter, FileDown, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MonthlyDetailedReport({ projectId: initialProjectId }: { projectId?: string }) {
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // First day of current month
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function fetchReport() {
    setLoading(true);
    try {
      const result = await getDetailedProjectReport(projectId || undefined, startDate, endDate);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-2 border-primary/5 bg-accent/5 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros do Relatório
          </CardTitle>
          <CardDescription>Selecione o período e projeto para gerar os detalhes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data Início
              </Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Data Fim
              </Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold flex items-center gap-1">
                <Search className="w-3 h-3" /> ID do Projeto (Opcional)
              </Label>
              <Input 
                placeholder="Todos os projetos" 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)} 
                className="h-9"
              />
            </div>
            <Button onClick={fetchReport} disabled={loading} className="h-9 font-bold">
               {loading ? "Gerando..." : "Gerar Relatório"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
               <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Total de Horas</span>
                  <span className="text-2xl font-black text-primary">{formatDuration(data.summary.totalMinutes)}</span>
               </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
               <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Valor Acumulado</span>
                  <span className="text-2xl font-black text-green-600">{formatCurrency(data.summary.totalValue)}</span>
               </CardContent>
            </Card>
            <Card className="bg-muted/30">
               <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Registros</span>
                  <span className="text-2xl font-black text-foreground">{data.activities.length} Atividades</span>
               </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border-2 shadow-xl">
            <div className="px-6 py-4 bg-muted/40 border-b flex justify-between items-center">
               <h3 className="font-bold text-sm tracking-widest uppercase">Detalhamento das Atividades</h3>
               <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold" onClick={() => window.print()}>
                  <FileDown className="mr-1 h-3 w-3" /> Imprimir / PDF
               </Button>
            </div>
            <CardContent className="p-0 overflow-x-auto">
              {data.activities.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground italic">Nenhuma atividade encontrada para o período.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="text-[10px] font-bold uppercase">Data</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Projeto</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase">Descrição</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-center">Duração</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-right">Valor</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.activities.map((act: any) => (
                      <TableRow key={act.id} className="hover:bg-accent/5 transition-colors group">
                        <TableCell className="text-xs whitespace-nowrap py-4">
                           {act.startTime ? new Date(act.startTime).toLocaleDateString('pt-BR') : '—'}
                        </TableCell>
                        <TableCell className="text-xs font-semibold py-4">
                           {act.project.name}
                        </TableCell>
                        <TableCell className="py-4">
                           <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">{act.description}</span>
                              {(act.sprint || act.ticket) && (
                                <div className="flex gap-1">
                                  {act.sprint && <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-normal">{act.sprint}</Badge>}
                                  {act.ticket && <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-normal">{act.ticket}</Badge>}
                                </div>
                              )}
                           </div>
                        </TableCell>
                        <TableCell className="text-xs text-center font-mono py-4">
                           {formatDuration(act.durationMinutes)}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold text-green-600 py-4">
                           {formatCurrency(Number(act.value))}
                        </TableCell>
                        <TableCell className="text-center py-4">
                           <Badge variant="outline" className={`text-[9px] px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                              act.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                              act.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                           }`}>
                              {act.status || 'pending'}
                           </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
