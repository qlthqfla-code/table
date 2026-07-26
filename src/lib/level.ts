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

/**
 * ═══ شرح للمناقشة: حساب المستوى الدراسي ═══
 * بدل ما "المستوى" يتحدد بالسنة الدراسية (زي "الطالب في سنة تانية")، هو
 * فعليًا متحدد بعدد الساعات المعتمدة اللي الطالب خلصها فعلاً (نظام الساعات
 * المعتمدة) — يعني ممكن طالب "يتأخر" لو رسب في مواد، أو "يتقدم" لو خلص
 * ساعات زيادة.
 *
 * LEVEL_THRESHOLDS فيها 4 أرقام لكل قسم = الحد الأدنى من الساعات اللي
 * الطالب لازم يكون خلصها عشان "يترقّى" للمستوى اللي بعده. الأرقام دي مش
 * عشوائية — اتحسبت من مجموع ساعات مواد كل سنة في المنهج الرسمي.
 *
 * الحلقة بتتحرك من أول threshold للآخر وتزود level كل ما الطالب يكون عدى
 * الرقم ده، وتوقف أول ما تلاقي threshold لسه ما وصلهوش (break) — يعني لو
 * الطالب عنده 70 ساعة في قسم حاسبات (thresholds: 36, 69, 102, 135)،
 * هيعدي أول اتنين (36 و69) فيبقى مستواه 2، ويوقف عند 102 لأنه لسه ما وصلهاش.
 */
export function getLevelForHours(department: Department, completedHours: number): number {
  const thresholds = LEVEL_THRESHOLDS[department];
  let level = 0;
  for (const threshold of thresholds) {
    if (completedHours >= threshold) level++;
    else break;
  }
  return level;
}
