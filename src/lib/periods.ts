import { timeToMinutes, timesOverlap } from "@/lib/time";

/**
 * Fixed weekly periods, matching the college's real printed schedules:
 * 8 periods of 45 minutes each, starting 9:00, with a 30-minute break
 * after period 4 (12:00-12:30).
 */
export interface Period {
  number: number; // 1..8
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export const PERIODS: Period[] = [
  { number: 1, startTime: "09:00", endTime: "09:45" },
  { number: 2, startTime: "09:45", endTime: "10:30" },
  { number: 3, startTime: "10:30", endTime: "11:15" },
  { number: 4, startTime: "11:15", endTime: "12:00" },
  { number: 5, startTime: "12:30", endTime: "13:15" },
  { number: 6, startTime: "13:15", endTime: "14:00" },
  { number: 7, startTime: "14:00", endTime: "14:45" },
  { number: 8, startTime: "14:45", endTime: "15:30" },
];

export const BREAK = { afterPeriod: 4, startTime: "12:00", endTime: "12:30" };

export const MIN_BLOCK_MINUTES = 90; // a lecture/section block must span at least 2 periods

/**
 * ═══ شرح للمناقشة: تحويل الأوقات لشبكة فترات (جدول الحصص) ═══
 * الجدول النهائي (WeeklyCalendar) شكله فترات (1 لـ8) في صفوف، والأيام في
 * أعمدة — بالظبط زي الجدول الورقي الحقيقي اللي الأكاديمية بتطبعه. بس
 * البيانات المخزّنة في قاعدة البيانات هي أوقات عادية ("09:00"–"10:30")
 * مش أرقام فترات. الدالة دي هي الجسر بين الاتنين: بتاخد بداية ونهاية أي
 * محاضرة/تطبيق وبترجع كل الفترات (Period) اللي بتتقاطع معاه زمنيًا
 * (باستخدام نفس timesOverlap اللي بيكشف التعارضات!) — عشان الواجهة تعرف
 * في أنهي خانة/خانات من الجدول ترسم المادة دي.
 *
 * مثال: محاضرة من 10:30–12:00 بتتقاطع مع الفترة 3 (10:30–11:15) والفترة 4
 * (11:15–12:00)، فبترجع الاتنين، وبتترسم المادة ممتدة على الخانتين.
 */
export function periodsForBlock(startTime: string, endTime: string): Period[] {
  return PERIODS.filter((p) => timesOverlap(startTime, endTime, p.startTime, p.endTime));
}

export function blockDurationMinutes(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}
