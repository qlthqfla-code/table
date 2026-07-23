import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <Image
        src="/logo.png"
        alt="الأكاديمية الحديثة للهندسة والتكنولوجيا"
        width={4240}
        height={2345}
        priority
        className="h-11 w-auto sm:h-14"
      />
      <span className="hidden border-r border-primary-100 pr-3 text-xs font-medium text-primary-500 sm:block">
        جدول المواد الدراسية
      </span>
    </Link>
  );
}
