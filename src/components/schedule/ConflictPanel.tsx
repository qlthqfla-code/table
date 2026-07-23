import type { AlternativeSuggestion, ConflictDetail } from "@/types/course";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DAY_LABELS_AR, formatTime } from "@/lib/time";

function dayLabel(day: string) {
  return DAY_LABELS_AR[day as keyof typeof DAY_LABELS_AR] ?? day;
}

export function ConflictPanel({
  conflicts,
  alternatives,
  onReplace,
}: {
  conflicts: ConflictDetail[];
  alternatives: AlternativeSuggestion[];
  onReplace: (replaceCourseId: string, withCourseId: string) => void;
}) {
  const alternativesByReplacedId = new Map<string, AlternativeSuggestion[]>();
  for (const suggestion of alternatives) {
    const list = alternativesByReplacedId.get(suggestion.replaces.id) ?? [];
    list.push(suggestion);
    alternativesByReplacedId.set(suggestion.replaces.id, list);
  }

  return (
    <div className="flex flex-col gap-4">
      <Alert tone="danger">في تعارض بين المواد اللي اخترتها. راجع التفاصيل تحت.</Alert>

      <div className="flex flex-col gap-3">
        {conflicts.map(({ courseA, courseB }, index) => (
          <div
            key={index}
            className="rounded-xl border-2 border-danger-500 bg-danger-50 p-4"
          >
            <p className="text-sm font-semibold text-danger-700">
              تعارض في {dayLabel(courseA.day)} — {courseA.courseName} ({courseA.courseCode}) مع{" "}
              {courseB.courseName} ({courseB.courseCode})
            </p>
            <p className="mt-1 text-xs text-danger-600">
              {courseA.courseName}: {formatTime(courseA.startTime)}–{formatTime(courseA.endTime)}
              {"  ·  "}
              {courseB.courseName}: {formatTime(courseB.startTime)}–{formatTime(courseB.endTime)}
            </p>
          </div>
        ))}
      </div>

      {alternativesByReplacedId.size > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-primary-900">اقتراحات بديلة</h3>
          {[...alternativesByReplacedId.entries()].map(([replacedId, suggestions]) => (
            <div key={replacedId} className="rounded-xl border border-primary-100 p-4">
              <p className="mb-3 text-sm font-medium text-primary-800">
                بدائل لمادة {suggestions[0].replaces.courseName} ({suggestions[0].replaces.courseCode})
              </p>
              <div className="flex flex-col gap-2">
                {suggestions.map((s) => (
                  <div
                    key={s.alternative.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary-50 px-3 py-2"
                  >
                    <span className="text-xs text-primary-700">
                      {dayLabel(s.alternative.day)} · {formatTime(s.alternative.startTime)}–
                      {formatTime(s.alternative.endTime)}
                      {s.alternative.section ? ` · شعبة ${s.alternative.section}` : ""}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => onReplace(replacedId, s.alternative.id)}
                    >
                      استبدال
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
