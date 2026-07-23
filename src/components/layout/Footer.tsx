import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-primary-500 sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} الأكاديمية الحديثة للهندسة — نظام كشف تعارض الجداول</span>
        <Link href="/admin/login" className="hover:text-primary-700">
          دخول الأدمن
        </Link>
      </div>
    </footer>
  );
}
