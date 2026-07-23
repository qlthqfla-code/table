import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { Department } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/curriculum";

const departmentValues = new Set<string>(DEPARTMENTS.map((d) => d.value));

export async function GET(request: NextRequest) {
  const department = request.nextUrl.searchParams.get("department");
  if (!department || !departmentValues.has(department)) {
    return NextResponse.json({ error: "قسم غير صحيح" }, { status: 400 });
  }

  const courses = await prisma.course.findMany({
    where: { department: department as Department },
    orderBy: [{ courseName: "asc" }, { section: "asc" }],
  });

  const rows = courses.map((course) => ({
    "اسم المادة": course.courseName,
    "كود المادة": course.courseCode,
    "عدد الساعات": course.creditHours,
    "اليوم": course.day,
    "وقت البداية": course.startTime,
    "وقت النهاية": course.endTime,
    "القاعة": course.room ?? "",
    "المحاضر": course.instructor ?? "",
    "الشعبة": course.section ?? "",
    "المتطلبات السابقة": course.prerequisites.join("، "),
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Courses");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="courses-${department}.xlsx"`,
    },
  });
}
