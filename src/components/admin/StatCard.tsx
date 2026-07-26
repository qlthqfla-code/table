import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

const TONE_CLASSES = {
  primary: "bg-primary-50 text-primary-700",
  accent: "bg-accent-500/10 text-accent-600",
  success: "bg-success-50 text-success-700",
};

export function StatCard({
  value,
  label,
  icon,
  tone,
  clickable = false,
}: {
  value: number;
  label: string;
  icon: ReactNode;
  tone: keyof typeof TONE_CLASSES;
  clickable?: boolean;
}) {
  return (
    <Card className={`flex items-center gap-4 ${clickable ? "hover:shadow-md" : ""}`}>
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[tone]}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon}
        </svg>
      </span>
      <div className="flex flex-col">
        <p className="text-2xl font-bold text-primary-900 tabular-nums">{value}</p>
        <p className="text-xs text-primary-500">{label}</p>
      </div>
    </Card>
  );
}
