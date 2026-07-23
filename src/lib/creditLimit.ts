/**
 * Max credit hours a student can register in one term, capped by cumulative
 * GPA (out of 4) — a standard Egyptian-university registration rule.
 */
export function maxCreditHoursForGpa(gpa: number): number {
  if (gpa > 3) return 18;
  if (gpa >= 2) return 16;
  return 14;
}
