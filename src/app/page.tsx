import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const session = await getSession();

  const primaryHref =
    session?.role === "student"
      ? "/schedule"
      : session?.role === "admin"
        ? "/admin"
        : "/student/register";

  const primaryLabel =
    session?.role === "student"
      ? "روح لجدولي"
      : session?.role === "admin"
        ? "لوحة التحكم"
        : "ابدأ إنشاء جدولك";

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center sm:px-6">
      <span className="rounded-full bg-primary-50 px-4 py-1.5 text-xs font-semibold text-primary-700">
        الأكاديمية الحديثة للهندسة
      </span>

      <h1 className="text-3xl font-bold leading-tight text-primary-950 sm:text-4xl">
        اكتشف تعارض جدولك الدراسي قبل ما تسجل
      </h1>

      <p className="max-w-xl text-base leading-8 text-primary-500">
        اختار المواد اللي عايز تسجلها، والنظام هيتأكد إن مفيش تعارض في المواعيد
        بينها، وهيقترح عليك شعب بديلة لو لقى تعارض.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={primaryHref}>
          <Button className="px-6 py-3 text-base">{primaryLabel}</Button>
        </Link>
        {!session && (
          <Link href="/student/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              عندي حساب بالفعل
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
