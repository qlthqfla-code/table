import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/schedule/:path*",
    "/onboarding/:path*",
    "/api/admin/:path*",
    "/api/schedule/:path*",
    "/api/student/:path*",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;
  const isApi = pathname.startsWith("/api/");

  const requiresAdmin =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/api/admin");
  const requiresStudent =
    pathname.startsWith("/schedule") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/schedule") ||
    pathname.startsWith("/api/student");

  if (requiresAdmin && session?.role !== "admin") {
    if (isApi) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (requiresStudent && session?.role !== "student") {
    if (isApi) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/student/login", request.url));
  }

  // Force new students through the "which courses have you passed" step
  // before they can build a schedule (not required for /onboarding itself,
  // since that page doubles as the editor for updating the list later).
  const requiresOnboarding =
    pathname.startsWith("/schedule") || pathname.startsWith("/api/schedule");

  if (requiresOnboarding && session?.role === "student" && !session.onboarded) {
    if (isApi) {
      return NextResponse.json({ error: "لازم تحدد المواد اللي خلصتها الأول" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/onboarding/completed-courses", request.url));
  }

  return NextResponse.next();
}
