import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validators";
import { generateResetToken, RESET_TOKEN_TTL_MINUTES } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

// Always responds with the same generic message regardless of whether the
// email exists — avoids leaking which emails have accounts.
const GENERIC_MESSAGE = "لو الإيميل ده مسجل عندنا، هيوصلك لينك إعادة تعيين الباسورد خلال شوية.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const [admin, student] = await Promise.all([
    prisma.admin.findUnique({ where: { email }, select: { id: true } }),
    prisma.student.findUnique({ where: { email }, select: { id: true } }),
  ]);

  if (admin || student) {
    const { rawToken, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { email, usedAt: null } }),
      prisma.passwordResetToken.create({ data: { email, tokenHash, expiresAt } }),
    ]);

    const resetUrl = `${new URL(request.url).origin}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(email, resetUrl).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
