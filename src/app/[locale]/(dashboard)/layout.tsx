import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let hasClientProjects = false;
  let userRole = 'freelancer';

  if (user) {
    const profile = await prisma.profile.findUnique({ where: { id: user.id } });
    userRole = profile?.role || 'freelancer';

    const clientProject = await prisma.project.findFirst({
      where: {
        OR: [
          { clientProfileId: user.id },
          { projectAccess: { some: { profileId: user.id } } }
        ]
      }
    });
    hasClientProjects = !!clientProject;
  }

  return (
    <div className="flex bg-muted/10 min-h-screen print:bg-white">
      <Sidebar hasClientProjects={hasClientProjects} userRole={userRole} />
      <div className="flex flex-1 flex-col lg:pl-72 print:pl-0">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 p-6 lg:p-10 print:p-0">
          <div className="mx-auto max-w-7xl h-full rounded-2xl border border-dashed border-border/60 bg-muted/5 print:border-none print:shadow-none print:bg-white overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
