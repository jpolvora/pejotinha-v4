import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type BillingReportData = {
  freelancerName: string;
  clientName: string;
  projectName: string;
  startDate: string;
  endDate: string;
  activities: {
    date: string;
    description: string;
    durationMinutes: number;
    status: string;
  }[];
  totalAmountDue: number;
  hourlyRate: number;
};

export async function generateBillingReportPDF(data: BillingReportData): Promise<Buffer> {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("Proof of Work - Billing Report", 14, 22);

  // Freelancer & Client Info
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Freelancer: ${data.freelancerName}`, 14, 32);
  doc.text(`Client: ${data.clientName}`, 14, 38);
  doc.text(`Project: ${data.projectName}`, 14, 44);
  
  // Period
  doc.text(`Period: ${data.startDate} - ${data.endDate}`, 14, 50);

  // Table Data Preparation
  const tableData = data.activities.map((a) => [
    a.date,
    a.description,
    `${(a.durationMinutes / 60).toFixed(2)}h`,
    a.status,
  ]);

  const totalHours = data.activities.reduce((acc, a) => acc + a.durationMinutes, 0) / 60;

  // Render Table using autotable plugin
  autoTable(doc, {
    startY: 60,
    head: [["Date", "Activity Description", "Duration (h)", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [54, 162, 235] },
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY || 60;
  
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Hours: ${totalHours.toFixed(2)}h`, 14, finalY + 15);
  doc.text(`Hourly Rate: $${data.hourlyRate.toFixed(2)}`, 14, finalY + 23);
  
  doc.setFontSize(16);
  doc.text(`Total Due: $${data.totalAmountDue.toFixed(2)}`, 14, finalY + 33);

  // Output as Buffer for Server Actions/API Routes
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
