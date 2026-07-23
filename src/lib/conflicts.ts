import type { AlternativeSuggestion, ConflictDetail, CourseDTO } from "@/types/course";
import { timesOverlap } from "@/lib/time";

/**
 * Compares every pair of selected courses and flags the ones that overlap:
 * same day AND start1 < end2 AND start2 < end1 (see project-prompt.md section 3).
 */
export function findConflicts(selected: CourseDTO[]): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const courseA = selected[i];
      const courseB = selected[j];

      if (courseA.day !== courseB.day) continue;
      if (
        timesOverlap(
          courseA.startTime,
          courseA.endTime,
          courseB.startTime,
          courseB.endTime
        )
      ) {
        conflicts.push({ courseA, courseB });
      }
    }
  }

  return conflicts;
}

/**
 * For each course involved in a conflict, looks for another section of the
 * same subject (same courseCode, different id) that would not conflict with
 * any of the student's other currently-selected courses.
 */
export function findAlternatives(
  conflicts: ConflictDetail[],
  allCourses: CourseDTO[],
  selected: CourseDTO[]
): AlternativeSuggestion[] {
  const conflictingCourseIds = new Set<string>();
  for (const { courseA, courseB } of conflicts) {
    conflictingCourseIds.add(courseA.id);
    conflictingCourseIds.add(courseB.id);
  }

  const suggestions: AlternativeSuggestion[] = [];

  for (const conflictingId of conflictingCourseIds) {
    const replaces = selected.find((c) => c.id === conflictingId);
    if (!replaces) continue;

    const others = selected.filter((c) => c.id !== replaces.id);

    const candidates = allCourses.filter(
      (c) => c.courseCode === replaces.courseCode && c.id !== replaces.id
    );

    for (const candidate of candidates) {
      const wouldConflict = others.some(
        (other) =>
          other.day === candidate.day &&
          timesOverlap(
            other.startTime,
            other.endTime,
            candidate.startTime,
            candidate.endTime
          )
      );
      if (!wouldConflict) {
        suggestions.push({ replaces, alternative: candidate });
      }
    }
  }

  return suggestions;
}
