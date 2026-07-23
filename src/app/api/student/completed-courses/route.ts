import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, destroySessionCookie, getSession } from "@/lib/auth";
import { completedCoursesSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = completedCoursesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  try {
    await prisma.student.update({
      where: { id: session.id },
      data: {
        completedCourseCodes: parsed.data.courseCodes,
        completedCoursesSetAt: new Date(),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      // Session cookie points at a student row that no longer exists
      // (e.g. the account was removed). Clear it so the client redirects
      // to login instead of retrying forever.
      await destroySessionCookie();
      return NextResponse.json(
        { error: "الجلسة انتهت، سجل دخول تاني" },
        { status: 401 }
      );
    }
    throw err;
  }

  // Re-issue the session so the `onboarded` flag the proxy checks is fresh.
  await createSessionCookie({ id: session.id, role: "student", onboarded: true });

  return NextResponse.json({ ok: true });
}
