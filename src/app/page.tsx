import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    title: "كشف التعارضات لحظيًا",
    description: "مقارنة معاد كل محاضرة وتطبيق تختاره مع باقي جدولك تلقائيًا قبل ما تأكد التسجيل.",
    icon: (
      <path
        d="M12 3v6m0 6v6m9-9h-6m-6 0H3m14.5-6.5-4.24 4.24m-4.52 4.52L4.5 17.5m13 0-4.24-4.24m-4.52-4.52L4.5 4.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "اقتراحات بديلة ذكية",
    description: "لو في تعارض، النظام يرشّحلك شعب بديلة بمواعيد مختلفة لنفس المادة على طول.",
    icon: <path d="M4 12a8 8 0 0 1 14.6-4.5M20 12a8 8 0 0 1-14.6 4.5M9 3.5 4.4 7.5M15 20.5l4.6-4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "متطلبات سابقة تلقائية",
    description: "المواد المقفولة بتتوضح وتتفتح تلقائي حسب المواد اللي خلصتها فعلًا.",
    icon: <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5V10Z" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    title: "سقف ساعات حسب المعدل",
    description: "أقصى عدد ساعات مسموح بيه بيتحسب أوتوماتيك حسب معدلك التراكمي.",
    icon: <path d="M4 19V5m5 14V9m5 10V13m5 6V7" strokeLinecap="round" strokeLinejoin="round" />,
  },
];

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
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="rounded-full border border-primary-100 bg-white/80 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur">
          الأكاديمية الحديثة للهندسة
        </span>

        <h1 className="text-3xl font-bold leading-tight text-primary-950 sm:text-5xl sm:leading-tight">
          اكتشف تعارض جدولك الدراسي
          <br className="hidden sm:block" /> قبل ما تسجل
        </h1>

        <p className="max-w-xl text-base leading-8 text-primary-600 sm:text-lg">
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

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-20 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {feature.icon}
              </svg>
            </span>
            <h3 className="text-sm font-bold text-primary-950">{feature.title}</h3>
            <p className="text-xs leading-6 text-primary-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
