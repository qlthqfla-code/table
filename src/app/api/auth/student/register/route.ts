import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Department } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { studentRegisterSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = studentRegisterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { fullName, email, universityId, password, department, gpa } = parsed.data;

  const existing = await prisma.student.findFirst({
    where: { OR: [{ email }, { universityId }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "في حساب مسجل بنفس الإيميل أو الرقم الجامعي" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const student = await prisma.student.create({
    data: {
      fullName,
      email,
      universityId,
      passwordHash,
      department: department as Department,
      gpa,
    },
  });

  await createSessionCookie({ id: student.id, role: "student", onboarded: false });

  return NextResponse.json({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
  });
}
