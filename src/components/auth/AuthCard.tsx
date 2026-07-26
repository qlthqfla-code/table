import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  icon,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={`mx-auto flex flex-col justify-center px-4 py-16 sm:px-6 ${wide ? "max-w-xl" : "max-w-md"}`}
    >
      <Card className="shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md shadow-primary-900/20">
            {icon}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-primary-950">{title}</h1>
            {subtitle && <p className="text-sm text-primary-500">{subtitle}</p>}
          </div>
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </Card>
    </div>
  );
}
