"use client";

import { useMemo, useState } from "react";
import type { CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";
import { YEAR_LABELS_AR } from "@/lib/curriculum";
import { missingPrerequisites } from "@/lib/prerequisites";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function yearLabel(year: number | null | undefined) {
  if (!year) return "مواد غير مصنّفة";
  return `السنة ${YEAR_LABELS_AR[year - 1] ?? year}`;
}

function CourseRow({
  course,
  isSelected,
  locked,
  missing,
  onSelect,
}: {
  course: CourseDTO;
  isSelected: boolean;
  locked: boolean;
  missing: string[];
  onSelect: () => void;
}) {
  return (
    <tr className={isSelected ? "bg-success-50" : "hover:bg-primary-50/60"}>
      <td className="whitespace-nowrap px-3 py-2 font-medium text-primary-900">
        {course.courseCode}
      </td>
      <td className="px-3 py-2 text-primary-800">{course.courseName}</td>
      <td className="px-3 py-2 text-primary-500">{course.section ?? "—"}</td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {DAY_LABELS_AR[course.day as keyof typeof DAY_LABELS_AR] ?? course.day}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {formatTime(course.startTime)}–{formatTime(course.endTime)}
      </td>
      <td className="px-3 py-2 text-primary-500">{course.room ?? "—"}</td>
      <td className="px-3 py-2 text-primary-500">{course.instructor ?? "—"}</td>
      <td className="px-3 py-2 text-primary-500">{course.creditHours}</td>
      <td className="whitespace-nowrap px-3 py-2">
        {isSelected ? (
          <button
            type="button"
            onClick={onSelect}
            className="rounded-md bg-success-500 px-2.5 py-1 text-xs font-semibold text-white hover:bg-success-700"
          >
            ✓ مختارة
          </button>
        ) : locked ? (
          <span
            title={`محتاج: ${missing.join("، ")}`}
            className="cursor-not-allowed rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-danger-500"
          >
            🔒 مقفولة
          </span>
        ) : (
          <button
            type="button"
            onClick={onSelect}
            className="rounded-md border border-primary-200 px-2.5 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50"
          >
            اختيار
          </button>
        )}
      </td>
    </tr>
  );
}

export function FullCatalogTable({
  allCourses,
  completedCourseCodes,
  selectedCourseIds,
  onSelect,
}: {
  allCourses: CourseDTO[];
  completedCourseCodes: Set<string>;
  selectedCourseIds: Set<string>;
  onSelect: (course: CourseDTO) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return null;
    return allCourses.filter(
      (c) => normalize(c.courseCode).includes(q) || normalize(c.courseName).includes(q)
    );
  }, [allCourses, query]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number | null, CourseDTO[]>();
    for (const course of allCourses) {
      const key = course.year ?? null;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(course);
    }
    return [...groups.entries()].sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity));
  }, [allCourses]);

  const columns = (
    <tr>
      <th className="px-3 py-2 font-semibold">كود المادة</th>
      <th className="px-3 py-2 font-semibold">اسم المادة</th>
      <th className="px-3 py-2 font-semibold">الشعبة</th>
      <th className="px-3 py-2 font-semibold">اليوم</th>
      <th className="px-3 py-2 font-semibold">الميعاد</th>
      <th className="px-3 py-2 font-semibold">القاعة</th>
      <th className="px-3 py-2 font-semibold">المحاضر</th>
      <th className="px-3 py-2 font-semibold">الساعات</th>
      <th className="px-3 py-2 font-semibold"></th>
    </tr>
  );

  function renderRow(course: CourseDTO) {
    const missing = missingPrerequisites(course, completedCourseCodes);
    return (
      <CourseRow
        key={course.id}
        course={course}
        isSelected={selectedCourseIds.has(course.id)}
        locked={missing.length > 0}
        missing={missing}
        onSelect={() => onSelect(course)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="دوّر باسم أو كود المادة..."
        className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

      <div className="max-h-[32rem] overflow-auto rounded-lg border border-primary-100">
        <table className="w-full min-w-[760px] text-right text-sm">
          <thead className="sticky top-0 bg-primary-800 text-white">{columns}</thead>

          {filtered ? (
            <tbody className="divide-y divide-primary-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-primary-400">
                    مفيش نتائج
                  </td>
                </tr>
              )}
              {filtered.map(renderRow)}
            </tbody>
          ) : (
            groupedByYear.map(([year, yearCourses]) => (
              <tbody key={year ?? "none"} className="divide-y divide-primary-50">
                <tr>
                  <td
                    colSpan={9}
                    className="sticky top-[37px] bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-800"
                  >
                    {yearLabel(year)} ({yearCourses.length})
                  </td>
                </tr>
                {yearCourses.map(renderRow)}
              </tbody>
            ))
          )}
        </table>
      </div>
    </div>
  );
}
