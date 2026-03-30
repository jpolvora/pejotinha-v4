import { getFreelancerExpenses, createExpense, deleteExpense } from "@/actions/expenses";
import { getProjects } from "@/actions/projects";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { formatCurrency, formatDate } from "@/lib/locale";
import { Receipt, Plus, Trash2, Wallet, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const expenses = await getFreelancerExpenses();
  const projects = await getProjects();
  
  const totalExpenses = expenses.reduce((acc: number, exp: any) => acc + Number(exp.amount), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
          <p className="text-muted-foreground">Manage your business expenses and tracking.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70 font-medium uppercase tracking-wider text-[10px]">Total Expenses</CardDescription>
            <CardTitle className="text-3xl font-bold">{formatCurrency(totalExpenses)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>{expenses.length} records found</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left: Add Expense Form */}
        <Card className="lg:col-span-1 h-fit shadow-lg border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              New Expense
            </CardTitle>
            <CardDescription>Record a new business cost.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" placeholder="e.g. Vercel Hosting" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (BRL)</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="e.g. Infrastructure, Software" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_id">Project (Optional)</Label>
                <Select name="project_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <SubmitButton label="Save Expense" />
            </form>
          </CardContent>
        </Card>

        {/* Right: Expenses List */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Your history of business spending.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No expenses recorded yet.</p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold">Project</th>
                      <th className="px-4 py-3 font-semibold text-right">Amount</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {expenses.map((exp: any) => (
                      <tr key={exp.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">{formatDate(exp.date)}</td>
                        <td className="px-4 py-4 font-medium">
                          {exp.description}
                          {exp.category && (
                            <span className="ml-2 text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded font-bold uppercase">
                              {exp.category}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground italic">
                           {exp.project?.name || "General Business"}
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-red-600 dark:text-red-400">
                          {formatCurrency(Number(exp.amount))}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <form action={async () => {
                            "use server";
                            await deleteExpense(exp.id);
                          }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
