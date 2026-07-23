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
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  instructor: string | null;
  creditHours: number;
  year: number | null;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function yearLabel(year: number | null) {
  if (year === null) return "مواد غير مصنّفة في المنهج";
  return `السنة ${YEAR_LABELS_AR[year - 1] ?? year}`;
}

function CourseRow({ course }: { course: AdminCourseRow }) {
  return (
    <tr className="hover:bg-primary-50/60">
      <td className="whitespace-nowrap px-3 py-2 font-medium text-primary-900">
        {course.courseCode}
      </td>
      <td className="px-3 py-2 text-primary-800">{course.courseName}</td>
      <td className="px-3 py-2 text-primary-500">{course.section ?? "—"}</td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {DAY_LABELS_AR[course.day as keyof typeof DAY_LABELS_AR] ?? course.day}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {formatTime(course.startTime)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-primary-500">
        {formatTime(course.endTime)}
      </td>
      <td className="px-3 py-2 text-primary-500">{course.room ?? "—"}</td>
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
    <tr>
      <th className="px-3 py-2 font-semibold">كود المادة</th>
      <th className="px-3 py-2 font-semibold">اسم المادة</th>
      <th className="px-3 py-2 font-semibold">الشعبة</th>
      <th className="px-3 py-2 font-semibold">اليوم</th>
      <th className="px-3 py-2 font-semibold">من</th>
      <th className="px-3 py-2 font-semibold">إلى</th>
      <th className="px-3 py-2 font-semibold">القاعة</th>
      <th className="px-3 py-2 font-semibold">المحاضر</th>
      <th className="px-3 py-2 font-semibold">الساعات</th>
    </tr>
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
        <table className="w-full min-w-[720px] text-right text-sm">
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
              {filtered.map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
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
