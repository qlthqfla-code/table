export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-6 text-xs text-primary-500 sm:px-6">
        <span>© {new Date().getFullYear()} الأكاديمية الحديثة للهندسة — نظام كشف تعارض الجداول</span>
      </div>
    </footer>
  );
}
