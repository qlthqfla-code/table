"use client";

import { useMemo, useState } from "react";
import { DEPARTMENTS, type Department } from "@/lib/curriculum";
import { UploadCoursesForm } from "@/components/admin/UploadCoursesForm";
import { CourseTable, type AdminCourseRow } from "@/components/admin/CourseTable";

export function AdminCoursesByDepartment({ courses }: { courses: AdminCourseRow[] }) {
  const [active, setActive] = useState<Department>(DEPARTMENTS[0].value);

  const countByDept = useMemo(() => {
    const map = new Map<Department, number>();
    for (const course of courses) {
      map.set(course.department, (map.get(course.department) ?? 0) + 1);
    }
    return map;
  }, [courses]);

  const activeCourses = useMemo(
    () => courses.filter((c) => c.department === active),
    [courses, active]
  );

  const activeLabel = DEPARTMENTS.find((d) => d.value === active)?.label ?? active;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {DEPARTMENTS.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => setActive(d.value)}
            className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              active === d.value
                ? "bg-primary-800 text-white"
                : "bg-primary-50 text-primary-700 hover:bg-primary-100"
            }`}
          >
            {d.label} ({countByDept.get(d.value) ?? 0})
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-primary-100 p-4">
        <h3 className="text-sm font-semibold text-primary-950">
          رفع جدول قسم {activeLabel}
        </h3>
        <p className="-mt-2 text-xs text-primary-400">
          أي رفع جديد هنا بيستبدل جدول قسم {activeLabel} بس، من غير ما يأثر على باقي الأقسام.
        </p>
        <UploadCoursesForm department={active} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-primary-950">
            جدول قسم {activeLabel} الحالي ({activeCourses.length})
          </h3>
          {activeCourses.length > 0 && (
            <a
              href={`/api/admin/courses/export?department=${active}`}
              download
              className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
            >
              تحميل كـ Excel
            </a>
          )}
        </div>
        {activeCourses.length === 0 ? (
          <p className="text-center text-sm text-primary-400">
            لسه مفيش مواد مرفوعة لقسم {activeLabel}.
          </p>
        ) : (
          <CourseTable courses={activeCourses} />
        )}
      </div>
    </div>
  );
}
