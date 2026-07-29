"use client";

import { useMemo, useState } from "react";
import type { CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";
import { YEAR_LABELS_AR } from "@/lib/curriculum";
import { missingPrerequisites } from "@/lib/prerequisites";

const COLUMN_COUNT = 4;

interface CourseGroup {
  courseCode: string;
  courseName: string;
  creditHours: number;
  year: number | null | undefined;
  sections: CourseDTO[];
}

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

/** One course can have many sections (شعب) — group them so the table shows
 * each course once instead of repeating a row per section. */
function groupByCourse(courses: CourseDTO[]): CourseGroup[] {
  const groups = new Map<string, CourseGroup>();
  for (const course of courses) {
    const existing = groups.get(course.courseCode);
    if (existing) {
      existing.sections.push(course);
    } else {
      groups.set(course.courseCode, {
        courseCode: course.courseCode,
        courseName: course.courseName,
        creditHours: course.creditHours,
        year: course.year,
        sections: [course],
      });
    }
  }
  return [...groups.values()];
}

function SectionRow({
  section,
  isSelected,
  locked,
  onSelect,
}: {
  section: CourseDTO;
  isSelected: boolean;
  locked: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-3 py-2 text-xs ${
        isSelected ? "border-success-500/40 bg-success-50" : "border-primary-100 bg-white"
      }`}
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-primary-900">
          شعبة {section.section ?? "—"}
          {section.instructor && <span className="font-normal text-primary-400"> · {section.instructor}</span>}
        </span>
        <span className="text-primary-500">
          محاضرة: {dayLabel(section.lectureDay)} {formatTime(section.lectureStartTime)}–
          {formatTime(section.lectureEndTime)}
          {section.lectureRoom && ` (${section.lectureRoom})`}
        </span>
        <span className="text-primary-500">
          تطبيق: {dayLabel(section.sectionDay)} {formatTime(section.sectionStartTime)}–
          {formatTime(section.sectionEndTime)}
          {section.sectionRoom && ` (${section.sectionRoom})`}
        </span>
      </div>

      {isSelected ? (
        <button
          type="button"
          onClick={onSelect}
          className="shrink-0 rounded-md bg-success-500 px-2.5 py-1 font-semibold text-white hover:bg-success-700"
        >
          ✓ مختارة
        </button>
      ) : (
        <button
          type="button"
          disabled={locked}
          onClick={onSelect}
          className="shrink-0 rounded-md border border-primary-200 px-2.5 py-1 font-semibold text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          اختيار
        </button>
      )}
    </div>
  );
}

function CourseGroupRow({
  group,
  expanded,
  onToggleExpand,
  selectedCourseIds,
  locked,
  missing,
  onSelect,
}: {
  group: CourseGroup;
  expanded: boolean;
  onToggleExpand: () => void;
  selectedCourseIds: Set<string>;
  locked: boolean;
  missing: string[];
  onSelect: (course: CourseDTO) => void;
}) {
  const selectedSection = group.sections.find((s) => selectedCourseIds.has(s.id));

  return (
    <>
      <tr className={selectedSection ? "bg-success-50" : "hover:bg-primary-50/60"}>
        <td className="whitespace-nowrap px-3 py-2 font-medium text-primary-900">{group.courseCode}</td>
        <td className="px-3 py-2 text-primary-800">{group.courseName}</td>
        <td className="px-3 py-2 text-primary-500">{group.creditHours}</td>
        <td className="px-3 py-2">
          {locked ? (
            <span
              title={`محتاج: ${missing.join("، ")}`}
              className="inline-flex cursor-not-allowed items-center gap-1 rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-danger-500"
            >
              🔒 مقفولة
            </span>
          ) : (
            <button
              type="button"
              onClick={onToggleExpand}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                selectedSection
                  ? "bg-success-500 text-white hover:bg-success-700"
                  : "border border-primary-200 text-primary-700 hover:bg-primary-50"
              }`}
            >
              {selectedSection ? `✓ شعبة ${selectedSection.section ?? "—"}` : `${group.sections.length} شعبة متاحة`}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </td>
      </tr>
      {expanded && !locked && (
        <tr>
          <td colSpan={COLUMN_COUNT} className="bg-primary-50/40 px-3 py-3">
            <div className="flex flex-col gap-2">
              {group.sections.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  isSelected={selectedCourseIds.has(section.id)}
                  locked={locked}
                  onSelect={() => onSelect(section)}
                />
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
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
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

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
    return [...groups.entries()]
      .sort(([a], [b]) => (a ?? Infinity) - (b ?? Infinity))
      .map(([year, courses]) => [year, groupByCourse(courses)] as const);
  }, [allCourses]);

  const filteredGroups = useMemo(() => (filtered ? groupByCourse(filtered) : null), [filtered]);

  function handleSelect(section: CourseDTO) {
    onSelect(section);
    setExpandedCode(null);
  }

  function renderGroupRow(group: CourseGroup) {
    const missing = missingPrerequisites(group.sections[0], completedCourseCodes);
    return (
      <CourseGroupRow
        key={group.courseCode}
        group={group}
        expanded={expandedCode === group.courseCode}
        onToggleExpand={() =>
          setExpandedCode((current) => (current === group.courseCode ? null : group.courseCode))
        }
        selectedCourseIds={selectedCourseIds}
        locked={missing.length > 0}
        missing={missing}
        onSelect={handleSelect}
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
        <table className="w-full text-right text-sm">
          <thead className="sticky top-0 bg-primary-800 text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">كود المادة</th>
              <th className="px-3 py-2 font-semibold">اسم المادة</th>
              <th className="px-3 py-2 font-semibold">الساعات</th>
              <th className="px-3 py-2 font-semibold">الشعبة</th>
            </tr>
          </thead>

          {filteredGroups ? (
            <tbody className="divide-y divide-primary-50">
              {filteredGroups.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="px-3 py-6 text-center text-primary-400">
                    مفيش نتائج
                  </td>
                </tr>
              )}
              {filteredGroups.map(renderGroupRow)}
            </tbody>
          ) : (
            groupedByYear.map(([year, groups]) => (
              <tbody key={year ?? "none"} className="divide-y divide-primary-50">
                <tr>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="sticky top-[37px] bg-primary-100 px-3 py-1.5 text-xs font-bold text-primary-800"
                  >
                    {yearLabel(year)} ({groups.length})
                  </td>
                </tr>
                {groups.map(renderGroupRow)}
              </tbody>
            ))
          )}
        </table>
      </div>
    </div>
  );
}
