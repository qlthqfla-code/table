import { courseBlocks, type AlternativeSuggestion, type ConflictDetail, type CourseDTO } from "@/types/course";
import { timesOverlap } from "@/lib/time";

/**
 * Each course meets twice a week (lecture + "تطبيق"), so two courses conflict
 * if *any* of their four block combinations land on the same day with
 * overlapping times. Returns the first colliding block pair, or null.
 */
function findBlockConflict(courseA: CourseDTO, courseB: CourseDTO) {
  for (const blockA of courseBlocks(courseA)) {
    for (const blockB of courseBlocks(courseB)) {
      if (blockA.day !== blockB.day) continue;
      if (timesOverlap(blockA.startTime, blockA.endTime, blockB.startTime, blockB.endTime)) {
        return { blockA, blockB };
      }
    }
  }
  return null;
}

/** Compares every pair of selected courses and flags the ones whose lecture or section blocks overlap. */
export function findConflicts(selected: CourseDTO[]): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const courseA = selected[i];
      const courseB = selected[j];
      const hit = findBlockConflict(courseA, courseB);
      if (hit) {
        conflicts.push({ courseA, courseB, blockA: hit.blockA, blockB: hit.blockB });
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
      const wouldConflict = others.some((other) => findBlockConflict(other, candidate) !== null);
      if (!wouldConflict) {
        suggestions.push({ replaces, alternative: candidate });
      }
    }
  }

  return suggestions;
}
