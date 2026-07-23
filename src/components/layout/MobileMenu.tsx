"use client";

import { useState } from "react";
import type { Role } from "@/lib/auth";
import { NavLinks } from "@/components/layout/NavLinks";
import { ProfileCard, type StudentProfile } from "@/components/layout/ProfileMenu";

export function MobileMenu({
  role,
  studentProfile,
}: {
  role: Role | null;
  studentProfile?: StudentProfile | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "قفل القائمة" : "فتح القائمة"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-700 hover:bg-primary-50"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 flex flex-col gap-4 border-b border-primary-100 bg-white px-4 py-4 shadow-lg">
          {studentProfile && (
            <div className="rounded-lg bg-primary-50 p-3">
              <ProfileCard profile={studentProfile} />
            </div>
          )}
          <NavLinks
            role={role}
            onNavigate={() => setOpen(false)}
            className="flex flex-col items-start gap-4"
          />
        </div>
      )}
    </div>
  );
}
