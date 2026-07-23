import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email } });
  const passwordMatches = admin
    ? await bcrypt.compare(password, admin.passwordHash)
    : false;

  if (!admin || !passwordMatches) {
    return NextResponse.json(
      { error: "الإيميل أو الباسورد غير صحيح" },
      { status: 401 }
    );
  }

  await createSessionCookie({ id: admin.id, role: "admin" });

  return NextResponse.json({ id: admin.id, email: admin.email });
}
