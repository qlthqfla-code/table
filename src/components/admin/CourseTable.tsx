"use client";

import { useMemo, useState } from "react";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";
import { YEAR_LABELS_AR, type Department } from "@/lib/curriculum";

export interface AdminCourseRow {
  id: string;
  department: Department;
  courseCode: string;
  courseName: string;
  section: string | null;
  instructor: string | null;
  creditHours: number;
  lectureDay: string;
  lectureStartTime: string;
  lectureEndTime: string;
  lectureRoom: string | null;
  sectionDay: string;
  sectionStartTime: string;
  sectionEndTime: string;
  sectionRoom: string | null;
  year: number | null;
}

const COLUMN_COUNT = 11;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function yearLabel(year: number | null) {
  if (year === null) return "مواد غير مصنّفة في المنهج";
  return `السنة ${YEAR_LABELS_AR[year - 1] ?? year}`;
}

function dayLabel(day: string) {
  return DAY_LABELS_AR[day as keyof typeof DAY_LABELS_AR] ?? day;
}

function CourseRow({ course }: { course: AdminCourseRow }) {
  return (
    <tr className="hover:bg-primary-50/60">
      <td className="sticky right-0 z-10 whitespace-nowrap bg-white px-3 py-2 font-medium text-primary-900 shadow-[-6px_0_6px_-6px_rgba(0,0,0,0.15)]">
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
    </tr>
  );
}

export function CourseTable({ courses }: { courses: AdminCourseRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return null;
    return courses.filter(
      (c) =>
        normalize(c.courseCode).includes(q) ||
        normalize(c.courseName).includes(q) ||
        normalize(c.instructor ?? "").includes(q)
    );
  }, [courses, query]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number | null, AdminCourseRow[]>();
    for (const course of courses) {
      if (!groups.has(course.year)) groups.set(course.year, []);
      groups.get(course.year)!.push(course);
    }
    return [...groups.entries()].sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity));
  }, [courses]);

  const columns = (
    <>
      <tr>
        <th className="sticky right-0 z-20 bg-primary-800 px-3 py-1.5 font-semibold" rowSpan={2}>
          كود المادة
        </th>
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

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="دوّر باسم أو كود المادة أو اسم المحاضر..."
        className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

      <p className="text-xs text-primary-400">
        {(filtered ?? courses).length} من {courses.length} شعبة/سكشن
      </p>

      <div className="max-h-[36rem] overflow-auto rounded-lg border border-primary-100">
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
              {filtered.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
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
                {yearCourses.map((course) => (
                  <CourseRow key={course.id} course={course} />
                ))}
              </tbody>
            ))
          )}
        </table>
      </div>
    </div>
  );
}
