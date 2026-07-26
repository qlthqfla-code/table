"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { TERM_LABELS_AR, YEAR_LABELS_AR } from "@/lib/curriculum";

interface Subject {
  courseCode: string;
  courseName: string;
  creditHours: number;
  isTraining: boolean;
  year: number;
  term: "Fall" | "Spring";
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function SubjectRow({
  subject,
  checked,
  onToggle,
}: {
  subject: Subject;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
        checked
          ? "border-success-500/40 bg-success-50"
          : "border-primary-100 bg-white hover:bg-primary-50"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-success-500"
      />
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold text-primary-900">
          {subject.courseCode}
        </span>
        <span className="block text-xs text-primary-500">{subject.courseName}</span>
        {!subject.isTraining && (
          <span className="text-[10px] text-primary-300">{subject.creditHours} ساعات</span>
        )}
      </span>
    </label>
  );
}

function CurriculumGrid({
  subjects,
  selected,
  onToggle,
  onToggleYear,
}: {
  subjects: Subject[];
  selected: Set<string>;
  onToggle: (code: string) => void;
  onToggleYear: (codes: string[], select: boolean) => void;
}) {
  const years = useMemo(() => {
    const byYear = new Map<number, { Fall: Subject[]; Spring: Subject[] }>();
    for (const subject of subjects) {
      if (!byYear.has(subject.year)) byYear.set(subject.year, { Fall: [], Spring: [] });
      byYear.get(subject.year)![subject.term].push(subject);
    }
    return [...byYear.entries()].sort(([a], [b]) => a - b);
  }, [subjects]);

  return (
    <div className="grid auto-cols-[240px] grid-flow-col gap-3 overflow-x-auto pb-2">
      {years.map(([year, { Fall, Spring }]) => {
        const yearCodes = [...Fall, ...Spring].map((s) => s.courseCode);
        const selectedCount = yearCodes.filter((code) => selected.has(code)).length;
        const allSelected = yearCodes.length > 0 && selectedCount === yearCodes.length;

        return (
          <div key={year} className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg bg-primary-800 px-3 py-2 text-white">
              <span className="text-sm font-semibold">السنة {YEAR_LABELS_AR[year - 1] ?? year}</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-medium tabular-nums">
                {selectedCount}/{yearCodes.length}
              </span>
            </div>
            <label
              className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-[11px] font-medium transition-colors ${
                allSelected
                  ? "border-success-500/40 bg-success-50 text-success-700"
                  : "border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100"
              }`}
            >
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => onToggleYear(yearCodes, !allSelected)}
                className="h-3.5 w-3.5 accent-success-500"
              />
              أنا خلصت كل مواد السنة دي
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["Fall", "Spring"] as const).map((term) => (
                <div key={term} className="flex flex-col gap-1.5">
                  <div className="rounded-md bg-primary-50 px-2 py-1 text-center text-[11px] font-medium text-primary-600">
                    {TERM_LABELS_AR[term]}
                  </div>
                  {(term === "Fall" ? Fall : Spring).map((subject) => (
                    <SubjectRow
                      key={subject.courseCode}
                      subject={subject}
                      checked={selected.has(subject.courseCode)}
                      onToggle={() => onToggle(subject.courseCode)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CompletedCoursesPicker({
  subjects,
  initialSelected,
}: {
  subjects: Subject[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return null;
    return subjects.filter(
      (s) => normalize(s.courseName).includes(q) || normalize(s.courseCode).includes(q)
    );
  }, [subjects, query]);

  function toggle(code: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleMany(codes: string[], select: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const code of codes) {
        if (select) next.add(code);
        else next.delete(code);
      }
      return next;
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/student/completed-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCodes: [...selected] }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          window.location.href = "/student/login";
          return;
        }
        setError(data.error ?? "حصل خطأ، حاول تاني");
        setLoading(false);
        return;
      }

      // Hard navigation, not router.push: the Navbar's "جدولي" link to
      // /schedule may have been prefetched while we were still unonboarded,
      // and the client router cache can replay that stale redirect even
      // after this request updates the session cookie.
      window.location.href = "/schedule";
    } catch {
      setError("تعذر الاتصال بالسيرفر، تأكد من الإنترنت وحاول تاني");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="دوّر باسم أو كود المادة..."
        className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

      {filtered ? (
        <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="p-4 text-center text-sm text-primary-400">مفيش نتائج</p>
          )}
          {filtered.map((subject) => (
            <SubjectRow
              key={subject.courseCode}
              subject={subject}
              checked={selected.has(subject.courseCode)}
              onToggle={() => toggle(subject.courseCode)}
            />
          ))}
        </div>
      ) : (
        <CurriculumGrid
          subjects={subjects}
          selected={selected}
          onToggle={toggle}
          onToggleYear={toggleMany}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
        <p className="text-xs text-primary-600">
          <span className="rounded-full bg-primary-800 px-2 py-0.5 font-semibold text-white tabular-nums">
            {selected.size}
          </span>{" "}
          مادة مختارة. لو لسه ما خلصتش أي مادة، كمّل من غير ما تختار حاجة.
        </p>
        <Button type="button" onClick={handleSubmit} disabled={loading} className="shrink-0">
          {loading ? "جاري الحفظ..." : "حفظ ومتابعة"}
        </Button>
      </div>
    </div>
  );
}
