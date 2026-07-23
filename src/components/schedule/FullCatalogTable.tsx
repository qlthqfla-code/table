"use client";

import { useMemo, useState } from "react";
import type { CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";
import { YEAR_LABELS_AR } from "@/lib/curriculum";
import { missingPrerequisites } from "@/lib/prerequisites";

const COLUMN_COUNT = 12;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function yearLabel(year: number | null | undefined) {
  if (!year) return "مواد غير مصنّفة";
  return `السنة ${YEAR_LABELS_AR[year - 1] ?? year}`;
}

function dayLabel(day: string) {
  return DAY_LABELS_AR[day as keyof typeof DAY_LABELS_AR] ?? day;
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

      <td className="whitespace-nowrap px-3 py-2 text-primary-500">{dayLabel(course.lectureDay)}</td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {formatTime(course.lectureStartTime)}–{formatTime(course.lectureEndTime)}
      </td>
      <td className="px-3 py-2 text-primary-500">{course.lectureRoom ?? "—"}</td>

      <td className="whitespace-nowrap px-3 py-2 text-primary-500">{dayLabel(course.sectionDay)}</td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {formatTime(course.sectionStartTime)}–{formatTime(course.sectionEndTime)}
      </td>
      <td className="px-3 py-2 text-primary-500">{course.sectionRoom ?? "—"}</td>

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
    <>
      <tr>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}>كود المادة</th>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}>اسم المادة</th>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}>الشعبة</th>
        <th className="border-r border-primary-600 px-3 py-1 text-center font-semibold" colSpan={3}>
          المحاضرة
        </th>
        <th className="border-r border-primary-600 px-3 py-1 text-center font-semibold" colSpan={3}>
          التطبيق
        </th>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}>المحاضر</th>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}>الساعات</th>
        <th className="px-3 py-1.5 font-semibold" rowSpan={2}></th>
      </tr>
      <tr>
        <th className="border-r border-primary-600 px-3 py-1.5 font-medium">اليوم</th>
        <th className="px-3 py-1.5 font-medium">الميعاد</th>
        <th className="px-3 py-1.5 font-medium">القاعة</th>
        <th className="border-r border-primary-600 px-3 py-1.5 font-medium">اليوم</th>
        <th className="px-3 py-1.5 font-medium">الميعاد</th>
        <th className="px-3 py-1.5 font-medium">القاعة</th>
      </tr>
    </>
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
        <table className="w-full min-w-[980px] text-right text-sm">
          <thead className="sticky top-0 bg-primary-800 text-white">{columns}</thead>

          {filtered ? (
            <tbody className="divide-y divide-primary-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-3 py-6 text-center text-primary-400">
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
                    colSpan={COLUMN_COUNT}
                    className="sticky top-[65px] bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-800"
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
