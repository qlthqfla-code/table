/** Days ordered as the Egyptian academic week (Friday is off). */
export const DAY_ORDER = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
] as const;

export type Day = (typeof DAY_ORDER)[number];

export const DAY_LABELS_AR: Record<Day, string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
};

const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value.trim());
}

export function timeToMinutes(value: string): number {
  const match = value.trim().match(TIME_RE);
  if (!match) {
    throw new Error(`Invalid time format: "${value}", expected HH:mm`);
  }
  const [, hours, minutes] = match;
  return Number(hours) * 60 + Number(minutes);
}

export function formatTime(value: string): string {
  const [h, m] = value.split(":").map(Number);
  const period = h < 12 ? "ص" : "م";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Two time ranges conflict when they overlap, per project spec:
 * start1 < end2 AND start2 < end1
 */
export function timesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(startB) < timeToMinutes(endA)
  );
}
