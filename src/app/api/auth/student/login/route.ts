import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { studentLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = studentLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const student = await prisma.student.findUnique({ where: { email } });
  const passwordMatches = student
    ? await bcrypt.compare(password, student.passwordHash)
    : false;

  if (!student || !passwordMatches) {
    return NextResponse.json(
      { error: "الإيميل أو الباسورد غير صحيح" },
      { status: 401 }
    );
  }

  await createSessionCookie({
    id: student.id,
    role: "student",
    onboarded: !!student.completedCoursesSetAt,
  });

  return NextResponse.json({
    id: student.id,
    fullName: student.fullName,
    email: student.email,
  });
}
