import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/students/[id]">
) {
  const { id } = await ctx.params;

  const student = await prisma.student.findUnique({ where: { id }, select: { id: true } });
  if (!student) {
    return NextResponse.json({ error: "الطالب مش موجود" }, { status: 404 });
  }

  await prisma.student.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
