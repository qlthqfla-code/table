import { NextRequest, NextResponse } from "next/server";
import { Department } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseCourseWorkbook } from "@/lib/excel";
import { DEPARTMENTS } from "@/lib/curriculum";

const departmentValues = new Set<string>(DEPARTMENTS.map((d) => d.value));

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const department = formData?.get("department");

  if (typeof department !== "string" || !departmentValues.has(department)) {
    return NextResponse.json({ error: "قسم غير صحيح" }, { status: 400 });
  }

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "لازم ترفع ملف Excel" }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const { rows, errors } = parseCourseWorkbook(buffer);

  if (rows.length === 0) {
    return NextResponse.json(
      { error: "مفيش ولا مادة اتقرأت بنجاح من الملف", rowErrors: errors },
      { status: 422 }
    );
  }

  // A fresh upload replaces this department's catalog only — each
  // department manages its own schedule independently (see /admin).
  // Cascades into any saved StudentScheduleItem rows for that department.
  await prisma.$transaction([
    prisma.course.deleteMany({ where: { department: department as Department } }),
    prisma.course.createMany({
      data: rows.map((row) => ({ ...row, department: department as Department })),
    }),
  ]);

  return NextResponse.json({
    added: rows.length,
    skipped: errors.length,
    rowErrors: errors,
  });
}
