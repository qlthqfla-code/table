import type { Department } from "@/lib/curriculum";

/**
 * Cumulative credit hours needed to finish each academic year, derived from
 * each department's real curriculum (prisma/curriculum/*.json, sourced from
 * https://shadowzxcv.github.io/subjects-modern-academy — same 5-year, 10-semester
 * flowsheets, summed per year with one representative subject per elective
 * group, matching that site's own per-semester credit-hour totals).
 *
 * A student's "مستوى" (level) is driven by how many hours they've actually
 * passed, not by calendar year — the credit-hour system used by the academy.
 * Level 0 = before finishing year 1, Level 4 = year 5 (final level).
 */
const LEVEL_THRESHOLDS: Record<Department, number[]> = {
  Computer: [36, 69, 102, 135],
  Communication: [36, 69, 103, 135],
  Architecture: [36, 70, 103, 136],
  Civil: [36, 71, 103, 135],
};

export const LEVEL_LABELS_AR = ["صفر", "الأول", "الثاني", "الثالث", "الرابع"];

export function getLevelForHours(department: Department, completedHours: number): number {
  const thresholds = LEVEL_THRESHOLDS[department];
  let level = 0;
  for (const threshold of thresholds) {
    if (completedHours >= threshold) level++;
    else break;
  }
  return level;
}
