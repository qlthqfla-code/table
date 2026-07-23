"use client";

import { useState } from "react";
import { DEPARTMENT_LABELS_AR, type Department } from "@/lib/curriculum";

export interface StudentProfile {
  fullName: string;
  universityId: string;
  department: Department;
  gpa: number;
}

export function ProfileCard({ profile }: { profile: StudentProfile }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-bold text-primary-950">{profile.fullName}</p>
      <dl className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center justify-between">
          <dt className="text-primary-400">الرقم الجامعي</dt>
          <dd className="font-medium text-primary-800">{profile.universityId}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-primary-400">القسم</dt>
          <dd className="font-medium text-primary-800">
            {DEPARTMENT_LABELS_AR[profile.department]}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-primary-400">GPA</dt>
          <dd className="font-medium text-primary-800">{profile.gpa.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}

export function ProfileMenu({ profile }: { profile: StudentProfile }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="بيانات الحساب"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-12 z-40 w-64 rounded-xl border border-primary-100 bg-white p-4 shadow-lg">
            <ProfileCard profile={profile} />
          </div>
        </>
      )}
    </div>
  );
}
