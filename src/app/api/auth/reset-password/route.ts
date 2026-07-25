import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validators";
import { hashResetToken } from "@/lib/passwordReset";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "لينك إعادة التعيين منتهي أو مستخدم قبل كده، اطلب لينك جديد" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.findUnique({
    where: { email: resetToken.email },
    select: { id: true },
  });

  if (admin) {
    await prisma.$transaction([
      prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  const student = await prisma.student.findUnique({
    where: { email: resetToken.email },
    select: { id: true },
  });

  if (student) {
    await prisma.$transaction([
      prisma.student.update({ where: { id: student.id }, data: { passwordHash } }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "الحساب مش موجود" }, { status: 404 });
}
