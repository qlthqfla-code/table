"use client";

import { useMemo, useState } from "react";
import type { CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";
import { buildCourseNameMap, missingPrerequisites } from "@/lib/prerequisites";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function courseLabel(course: CourseDTO) {
  const day = DAY_LABELS_AR[course.day as keyof typeof DAY_LABELS_AR] ?? course.day;
  const sectionLabel = course.section ? ` - شعبة ${course.section}` : "";
  return `${day} ${formatTime(course.startTime)}–${formatTime(course.endTime)}${sectionLabel}`;
}

function Suggestions({
  courses,
  completedCourseCodes,
  excludedCourseCodes,
  nameMap,
  onPick,
}: {
  courses: CourseDTO[];
  completedCourseCodes: Set<string>;
  excludedCourseCodes: Set<string>;
  nameMap: Map<string, string>;
  onPick: (course: CourseDTO) => void;
}) {
  if (courses.length === 0) {
    return (
      <div className="absolute z-20 mt-1 w-full rounded-lg border border-primary-100 bg-white p-3 text-sm text-primary-400 shadow-lg">
        مفيش نتائج
      </div>
    );
  }

  return (
    <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-primary-100 bg-white py-1 shadow-lg">
      {courses.map((course) => {
        const missing = missingPrerequisites(course, completedCourseCodes);
        const alreadyAdded = excludedCourseCodes.has(course.courseCode);
        const locked = missing.length > 0 || alreadyAdded;

        return (
          <li key={course.id}>
            <button
              type="button"
              disabled={locked}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!locked) onPick(course);
              }}
              className={`flex w-full flex-col gap-0.5 px-3 py-2 text-right ${
                locked ? "cursor-not-allowed opacity-60" : "hover:bg-primary-50"
              }`}
            >
              <span className="text-sm font-medium text-primary-950">
                {course.courseName}{" "}
                <span className="font-normal text-primary-400">({course.courseCode})</span>
              </span>
              <span className="text-xs text-primary-500">{courseLabel(course)}</span>
              {alreadyAdded && (
                <span className="text-xs font-medium text-danger-600">
                  ✓ المادة دي متسجلة في صف تاني بالفعل
                </span>
              )}
              {!alreadyAdded && missing.length > 0 && (
                <span className="text-xs font-medium text-danger-600">
                  🔒 يتطلب: {missing.map((code) => nameMap.get(code) ?? code).join("، ")}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function CourseAutocomplete({
  allCourses,
  value,
  onChange,
  completedCourseCodes,
  excludedCourseCodes,
  subjectNames,
}: {
  allCourses: CourseDTO[];
  value: string | null;
  onChange: (courseId: string) => void;
  completedCourseCodes: Set<string>;
  excludedCourseCodes: Set<string>;
  subjectNames: { courseCode: string; courseName: string }[];
}) {
  // Remounted (via `key`) whenever the selected course changes from outside
  // (e.g. the "replace with alternative" action), so its local input state
  // resets cleanly instead of needing an effect to sync it.
  return (
    <CourseAutocompleteInner
      key={value ?? "empty"}
      allCourses={allCourses}
      value={value}
      onChange={onChange}
      completedCourseCodes={completedCourseCodes}
      excludedCourseCodes={excludedCourseCodes}
      subjectNames={subjectNames}
    />
  );
}

function CourseAutocompleteInner({
  allCourses,
  value,
  onChange,
  completedCourseCodes,
  excludedCourseCodes,
  subjectNames,
}: {
  allCourses: CourseDTO[];
  value: string | null;
  onChange: (courseId: string) => void;
  completedCourseCodes: Set<string>;
  excludedCourseCodes: Set<string>;
  subjectNames: { courseCode: string; courseName: string }[];
}) {
  const selected = useMemo(
    () => allCourses.find((c) => c.id === value) ?? null,
    [allCourses, value]
  );
  const nameMap = useMemo(
    () => buildCourseNameMap(allCourses, subjectNames),
    [allCourses, subjectNames]
  );

  const [nameQuery, setNameQuery] = useState(selected?.courseName ?? "");
  const [codeQuery, setCodeQuery] = useState(selected?.courseCode ?? "");
  const [openField, setOpenField] = useState<"name" | "code" | null>(null);

  const nameMatches = useMemo(() => {
    if (!openField || openField !== "name") return [];
    const q = normalize(nameQuery);
    if (!q) return allCourses.slice(0, 8);
    return allCourses.filter((c) => normalize(c.courseName).includes(q)).slice(0, 8);
  }, [allCourses, nameQuery, openField]);

  const codeMatches = useMemo(() => {
    if (!openField || openField !== "code") return [];
    const q = normalize(codeQuery);
    if (!q) return allCourses.slice(0, 8);
    return allCourses.filter((c) => normalize(c.courseCode).includes(q)).slice(0, 8);
  }, [allCourses, codeQuery, openField]);

  function pick(course: CourseDTO) {
    onChange(course.id);
    setOpenField(null);
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
      <div className="relative">
        <input
          value={nameQuery}
          onFocus={() => setOpenField("name")}
          onBlur={() => setOpenField((f) => (f === "name" ? null : f))}
          onChange={(e) => setNameQuery(e.target.value)}
          placeholder="اسم المادة"
          className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        {openField === "name" && (
          <Suggestions
            courses={nameMatches}
            completedCourseCodes={completedCourseCodes}
            excludedCourseCodes={excludedCourseCodes}
            nameMap={nameMap}
            onPick={pick}
          />
        )}
      </div>

      <div className="relative">
        <input
          value={codeQuery}
          onFocus={() => setOpenField("code")}
          onBlur={() => setOpenField((f) => (f === "code" ? null : f))}
          onChange={(e) => setCodeQuery(e.target.value)}
          placeholder="كود المادة"
          className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
        {openField === "code" && (
          <Suggestions
            courses={codeMatches}
            completedCourseCodes={completedCourseCodes}
            excludedCourseCodes={excludedCourseCodes}
            nameMap={nameMap}
            onPick={pick}
          />
        )}
      </div>

      <input
        readOnly
        value={selected ? `${selected.creditHours} ساعات` : ""}
        placeholder="عدد الساعات"
        className="w-full rounded-lg border border-primary-100 bg-primary-50 px-3.5 py-2.5 text-sm text-primary-700 outline-none"
      />
    </div>
  );
}
