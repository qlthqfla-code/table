"use client";

import { useMemo, useState } from "react";
import type { AlternativeSuggestion, ConflictDetail, CourseDTO } from "@/types/course";
import { CourseAutocomplete } from "@/components/schedule/CourseAutocomplete";
import { FullCatalogTable } from "@/components/schedule/FullCatalogTable";
import { ConflictPanel } from "@/components/schedule/ConflictPanel";
import { ScheduleExportActions } from "@/components/schedule/ScheduleExportActions";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { maxCreditHoursForGpa } from "@/lib/creditLimit";

interface Row {
  rowId: string;
  courseId: string | null;
}

function makeRowId() {
  return Math.random().toString(36).slice(2);
}

export function ScheduleBuilder({
  allCourses,
  initialSelected,
  completedCourseCodes,
  subjectNames,
  gpa,
}: {
  allCourses: CourseDTO[];
  initialSelected: CourseDTO[];
  completedCourseCodes: string[];
  subjectNames: { courseCode: string; courseName: string }[];
  gpa: number;
}) {
  const maxCreditHours = maxCreditHoursForGpa(gpa);
  const completedSet = useMemo(() => new Set(completedCourseCodes), [completedCourseCodes]);
  // A course the student already passed has nothing to register — drop it
  // from both pickers entirely instead of just leaving it selectable.
  const selectableCourses = useMemo(
    () => allCourses.filter((c) => !completedSet.has(c.courseCode)),
    [allCourses, completedSet]
  );
  const courseCodeById = useMemo(() => {
    const map = new Map<string, string>();
    for (const course of allCourses) map.set(course.id, course.courseCode);
    return map;
  }, [allCourses]);
  const creditHoursById = useMemo(() => {
    const map = new Map<string, number>();
    for (const course of allCourses) map.set(course.id, course.creditHours);
    return map;
  }, [allCourses]);
  const [rows, setRows] = useState<Row[]>(
    initialSelected.length > 0
      ? initialSelected.map((c) => ({ rowId: makeRowId(), courseId: c.id }))
      : [{ rowId: makeRowId(), courseId: null }]
  );
  const [view, setView] = useState<"build" | "conflict" | "confirmed">("build");
  const [conflictData, setConflictData] = useState<{
    conflicts: ConflictDetail[];
    alternatives: AlternativeSuggestion[];
  } | null>(null);
  const [confirmedCourses, setConfirmedCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullTable, setShowFullTable] = useState(false);

  const distinctCourseCount = useMemo(
    () => new Set(allCourses.map((c) => c.courseCode)).size,
    [allCourses]
  );
  const selectedCourseIds = useMemo(
    () => new Set(rows.map((r) => r.courseId).filter((id): id is string => !!id)),
    [rows]
  );
  const selectedCreditHours = useMemo(
    () =>
      [...selectedCourseIds].reduce((sum, id) => sum + (creditHoursById.get(id) ?? 0), 0),
    [selectedCourseIds, creditHoursById]
  );

  function addRow() {
    setRows((r) => [...r, { rowId: makeRowId(), courseId: null }]);
  }

  function removeRow(rowId: string) {
    setRows((r) => r.filter((row) => row.rowId !== rowId));
  }

  function setRowCourse(rowId: string, courseId: string) {
    setRows((r) => r.map((row) => (row.rowId === rowId ? { ...row, courseId } : row)));
  }

  async function submit(courseIds: string[]) {
    if (courseIds.length === 0) {
      setError("اختار مادة واحدة على الأقل");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseIds }),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      setConfirmedCourses(data.courses);
      setConflictData(null);
      setView("confirmed");
    } else if (res.status === 409 && data.conflicts) {
      setConflictData({ conflicts: data.conflicts, alternatives: data.alternatives ?? [] });
      setView("conflict");
    } else {
      setError(data.error ?? "حصل خطأ، حاول تاني");
    }

    setLoading(false);
  }

  function handleCreateSchedule() {
    const courseIds = rows.map((r) => r.courseId).filter((id): id is string => !!id);

    if (selectedCreditHours > maxCreditHours) {
      setError(
        `مجموع الساعات اللي اخترتها (${selectedCreditHours}) أكتر من الحد المسموح بمعدلك (${maxCreditHours} ساعة). شيل مادة أو أكتر.`
      );
      return;
    }

    const seenCodes = new Set<string>();
    for (const id of courseIds) {
      const code = courseCodeById.get(id);
      if (code && seenCodes.has(code)) {
        setError("مينفعش تسجل نفس المادة أكتر من مرة، شيل واحدة من الصفوف المكررة");
        return;
      }
      if (code) seenCodes.add(code);
    }

    submit(courseIds);
  }

  function handleReplace(replaceCourseId: string, withCourseId: string) {
    const newRows = rows.map((row) =>
      row.courseId === replaceCourseId ? { ...row, courseId: withCourseId } : row
    );
    setRows(newRows);
    submit(newRows.map((r) => r.courseId).filter((id): id is string => !!id));
  }

  /** Picking straight from the full catalog table: toggle off if the exact
   * same section is clicked again, swap in place if another section of the
   * same course is already selected, otherwise fill an empty row or add one. */
  function handleTableSelect(course: CourseDTO) {
    setRows((prev) => {
      const exactRow = prev.find((r) => r.courseId === course.id);
      if (exactRow) {
        const withoutIt = prev.filter((r) => r.rowId !== exactRow.rowId);
        return withoutIt.length > 0 ? withoutIt : [{ rowId: makeRowId(), courseId: null }];
      }

      const sameCodeRow = prev.find(
        (r) => r.courseId && courseCodeById.get(r.courseId) === course.courseCode
      );
      if (sameCodeRow) {
        return prev.map((r) =>
          r.rowId === sameCodeRow.rowId ? { ...r, courseId: course.id } : r
        );
      }

      const emptyRow = prev.find((r) => !r.courseId);
      if (emptyRow) {
        return prev.map((r) => (r.rowId === emptyRow.rowId ? { ...r, courseId: course.id } : r));
      }

      return [...prev, { rowId: makeRowId(), courseId: course.id }];
    });
  }

  if (view === "confirmed") {
    return (
      <div className="flex flex-col gap-6">
        <Alert tone="success">تم إنشاء الجدول من غير أي تعارض في المواعيد.</Alert>
        <ScheduleExportActions courses={confirmedCourses} />
        <Button variant="secondary" className="self-start" onClick={() => setView("build")}>
          تعديل الجدول
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
        <p className="text-sm text-primary-700">
          الجدول ده هو الجدول اللي رفعه الأدمن: <strong>{distinctCourseCount}</strong> مادة
          بإجمالي <strong>{allCourses.length}</strong> شعبة.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="shrink-0 px-3 py-1.5 text-xs"
          onClick={() => setShowFullTable((v) => !v)}
        >
          {showFullTable ? "إخفاء الجدول الكامل" : "عرض الجدول الكامل"}
        </Button>
      </div>

      <div
        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
          selectedCreditHours > maxCreditHours
            ? "border-danger-500/30 bg-danger-50 text-danger-700"
            : "border-primary-100 bg-white text-primary-700"
        }`}
      >
        <span>الساعات المختارة حاليًا</span>
        <span className="font-semibold">
          {selectedCreditHours} من {maxCreditHours} ساعة (حسب معدلك)
        </span>
      </div>

      {showFullTable && (
        <FullCatalogTable
          allCourses={selectableCourses}
          completedCourseCodes={completedSet}
          selectedCourseIds={selectedCourseIds}
          onSelect={handleTableSelect}
        />
      )}

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const excludedCourseCodes = new Set(
            rows
              .filter((r) => r.rowId !== row.rowId && r.courseId)
              .map((r) => courseCodeById.get(r.courseId as string))
              .filter((code): code is string => !!code)
          );

          return (
            <div key={row.rowId} className="flex items-start gap-2">
              <div className="flex-1">
                <CourseAutocomplete
                  allCourses={selectableCourses}
                  value={row.courseId}
                  onChange={(courseId) => setRowCourse(row.rowId, courseId)}
                  completedCourseCodes={completedSet}
                  excludedCourseCodes={excludedCourseCodes}
                  subjectNames={subjectNames}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRow(row.rowId)}
                className="mt-2.5 shrink-0 text-primary-300 hover:text-danger-500"
                aria-label="حذف المادة"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addRow}>
          + إضافة مادة
        </Button>
        <Button type="button" onClick={handleCreateSchedule} disabled={loading}>
          {loading ? "جاري التحقق..." : "إنشاء الجدول"}
        </Button>
      </div>

      {view === "conflict" && conflictData && (
        <ConflictPanel
          conflicts={conflictData.conflicts}
          alternatives={conflictData.alternatives}
          onReplace={handleReplace}
        />
      )}
    </div>
  );
}
