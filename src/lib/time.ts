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
 * ═══ شرح للمناقشة: قاعدة كشف التعارض الأساسية ═══
 * أي معادين (بداية1-نهاية1) و(بداية2-نهاية2) بيتعارضوا لو، وبس لو:
 *     بداية1 < نهاية2   و   بداية2 < بداية1
 * يعني كل ميعاد لازم يبدأ قبل ما التاني يخلص، في الاتجاهين.
 *
 * مثال بسيط: محاضرة (9:00–10:30) ومحاضرة تانية (10:00–11:00)
 *   9:00 < 11:00 ✓  و  10:00 < 10:30 ✓  →  في تعارض (فيه نص ساعة متداخلة: 10:00–10:30)
 *
 * مثال مفيش فيه تعارض: (9:00–10:30) و(10:30–12:00)
 *   9:00 < 12:00 ✓  لكن  10:30 < 10:30 ✗ (مش أصغر، يبقى الشرط مش متحقق بالكامل)
 *   → مفيش تعارض، لأن المادة التانية بتبدأ بالظبط لما الأولى بتخلص (مفيش تداخل حقيقي).
 *
 * ده أبسط وأدق طريقة رياضية لمقارنة فترتين زمنيتين، وبيتحول لدقايق
 * (timeToMinutes) الأول علشان المقارنة تبقى أرقام صحيحة مش نصوص "HH:mm".
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
