"use client";

import { useEffect, useRef, useState } from "react";
import { DEPARTMENT_LABELS_AR, type Department } from "@/lib/curriculum";
import { LEVEL_LABELS_AR } from "@/lib/level";

export interface StudentProfile {
  fullName: string;
  universityId: string;
  department: Department;
  gpa: number;
  level: number;
}

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "").concat(parts[1]?.[0] ?? "").toUpperCase();
}

function gpaTone(gpa: number) {
  if (gpa >= 3) return "bg-success-50 text-success-700";
  if (gpa >= 2) return "bg-warning-50 text-warning-500";
  return "bg-danger-50 text-danger-600";
}

export function Avatar({ fullName, className = "" }: { fullName: string; className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-bold text-white ${className}`}
      aria-hidden="true"
    >
      {initials(fullName)}
    </span>
  );
}

export function ProfileCard({ profile }: { profile: StudentProfile }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar fullName={profile.fullName} className="h-11 w-11 text-base" />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-bold text-primary-950">{profile.fullName}</p>
          <p className="text-xs text-primary-400">{DEPARTMENT_LABELS_AR[profile.department]}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex flex-col gap-1 rounded-lg border border-primary-100 bg-white px-3 py-2">
          <dt className="text-primary-400">الرقم الجامعي</dt>
          <dd className="font-semibold tabular-nums text-primary-900">{profile.universityId}</dd>
        </div>
        <div className={`flex flex-col gap-1 rounded-lg px-3 py-2 ${gpaTone(profile.gpa)}`}>
          <dt className="opacity-80">المعدل التراكمي</dt>
          <dd className="font-semibold tabular-nums">{profile.gpa.toFixed(2)}</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-primary-100 bg-primary-50/70 px-3 py-2">
          <dt className="text-primary-400">المستوى</dt>
          <dd className="font-semibold text-primary-900">{LEVEL_LABELS_AR[profile.level]}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ProfileMenu({ profile }: { profile: StudentProfile }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="بيانات الحساب"
        aria-expanded={open}
        className="rounded-full transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
      >
        <Avatar
          fullName={profile.fullName}
          className={`h-9 w-9 ring-2 ring-offset-2 transition-all ${
            open ? "ring-primary-400" : "ring-transparent hover:ring-primary-200"
          }`}
        />
      </button>

      <div
        role="menu"
        className={`absolute left-0 top-12 z-40 w-72 origin-top-left rounded-2xl border border-primary-100 bg-white p-4 shadow-xl transition-all duration-150 ease-out ${
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <ProfileCard profile={profile} />
      </div>
    </div>
  );
}
