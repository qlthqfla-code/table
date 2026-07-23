"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function NavLink({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
        active
          ? "bg-primary-50 font-semibold text-primary-900"
          : "text-primary-700 hover:bg-primary-50/60 hover:text-primary-900"
      } ${className}`}
    >
      {children}
    </Link>
  );
}
