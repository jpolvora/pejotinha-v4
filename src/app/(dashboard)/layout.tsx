import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/dashboard/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-muted/10 min-h-screen print:bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:pl-72 print:pl-0">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 p-6 lg:p-10 print:p-0">
          <div className="mx-auto max-w-7xl h-full rounded-2xl border border-dashed border-border/60 bg-muted/5 print:border-none print:shadow-none print:bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
