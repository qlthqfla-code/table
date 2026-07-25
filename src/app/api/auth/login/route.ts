import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
    await createSessionCookie({ id: admin.id, role: "admin" });
    return NextResponse.json({ role: "admin" });
  }

  const student = await prisma.student.findUnique({ where: { email } });
  if (student && (await bcrypt.compare(password, student.passwordHash))) {
    await createSessionCookie({
      id: student.id,
      role: "student",
      onboarded: !!student.completedCoursesSetAt,
    });
    return NextResponse.json({ role: "student", onboarded: !!student.completedCoursesSetAt });
  }

  return NextResponse.json({ error: "الإيميل أو الباسورد غير صحيح" }, { status: 401 });
}
