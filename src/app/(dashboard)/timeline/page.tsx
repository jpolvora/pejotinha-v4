import prisma from "@/lib/prisma";
import TimelinePageContent from "@/components/timeline/timeline-page-content";
import { getDashboardStats } from "@/actions/dashboard"; // To ensure auth session

export default async function TimelinePage() {
  // We need to fetch basic project list for the filter dropdown
  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container py-8 md:py-12">
      <TimelinePageContent projects={projects} />
    </div>
  );
}
