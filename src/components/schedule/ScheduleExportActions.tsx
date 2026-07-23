"use client";

import { useRef, useState } from "react";
import type { CourseDTO } from "@/types/course";
import { WeeklyCalendar } from "@/components/schedule/WeeklyCalendar";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ScheduleExportActions({ courses }: { courses: CourseDTO[] }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  async function handleSavePdf() {
    if (!printRef.current) return;
    setExporting(true);
    setError(null);

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
      const renderWidth = canvas.width * ratio;
      const renderHeight = canvas.height * ratio;
      const x = (pageWidth - renderWidth) / 2;
      const y = (pageHeight - renderHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, renderWidth, renderHeight);
      pdf.save("جدولي-الدراسي.pdf");
    } catch {
      setError("حصل خطأ أثناء حفظ الملف، حاول تاني");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button type="button" variant="secondary" onClick={handlePrint}>
          طباعة الجدول
        </Button>
        <Button type="button" variant="secondary" onClick={handleSavePdf} disabled={exporting}>
          {exporting ? "جاري الحفظ..." : "حفظ كـ PDF"}
        </Button>
      </div>

      <div id="printable-schedule" ref={printRef} className="rounded-xl bg-white p-4">
        <div className="mb-4 hidden print:block">
          <h2 className="text-lg font-bold text-primary-950">جدولي الدراسي</h2>
        </div>
        <WeeklyCalendar courses={courses} />
      </div>
    </div>
  );
}
