import { ReactNode } from "react";

type Tone = "danger" | "success" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  danger: "bg-danger-50 text-danger-700 border-danger-100",
  success: "bg-success-50 text-success-700 border-success-500/20",
  warning: "bg-warning-50 text-warning-500 border-warning-500/20",
};

export function Alert({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}>
      {children}
    </div>
  );
}
