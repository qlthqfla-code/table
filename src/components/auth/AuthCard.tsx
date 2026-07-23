import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <Card>
        <div className="mb-6 flex flex-col gap-1 text-center">
          <h1 className="text-xl font-bold text-primary-950">{title}</h1>
          {subtitle && <p className="text-sm text-primary-500">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </Card>
    </div>
  );
}
