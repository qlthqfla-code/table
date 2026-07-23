import * as XLSX from "xlsx";
import { isValidTime } from "@/lib/time";

export interface ParsedCourseRow {
  courseCode: string;
  courseName: string;
  creditHours: number;
  section: string | null;
  instructor: string | null;
  room: string | null;
  day: string;
  startTime: string;
  endTime: string;
  prerequisites: string[];
}

export interface RowError {
  row: number; // spreadsheet row number (header = 1)
  message: string;
}

export interface ParseResult {
  rows: ParsedCourseRow[];
  errors: RowError[];
}

type RawRow = Record<string, unknown>;

const HEADER_ALIASES: Record<keyof Omit<ParsedCourseRow, "prerequisites">, string[]> = {
  courseName: ["اسم المادة", "المادة", "coursename", "course name", "name"],
  courseCode: ["كود المادة", "كود", "coursecode", "course code", "code"],
  creditHours: [
    "عدد الساعات",
    "الساعات",
    "الساعات المعتمدة",
    "credit hours",
    "credithours",
    "hours",
  ],
  section: ["الشعبة", "الشعبه", "الجروب", "section", "group"],
  instructor: ["المحاضر", "instructor", "lecturer"],
  room: ["القاعة", "القاعه", "room"],
  day: ["اليوم", "day"],
  startTime: ["وقت البداية", "بداية", "start time", "starttime"],
  endTime: ["وقت النهاية", "نهاية", "end time", "endtime"],
};

const PREREQ_ALIASES = ["المتطلبات السابقة", "المتطلبات", "prerequisites", "prereq"];

const DAY_ALIASES: Record<string, string> = {
  "السبت": "Saturday",
  saturday: "Saturday",
  sat: "Saturday",
  "الاحد": "Sunday",
  "الأحد": "Sunday",
  sunday: "Sunday",
  sun: "Sunday",
  "الاثنين": "Monday",
  "الإثنين": "Monday",
  monday: "Monday",
  mon: "Monday",
  "الثلاثاء": "Tuesday",
  tuesday: "Tuesday",
  tue: "Tuesday",
  "الاربعاء": "Wednesday",
  "الأربعاء": "Wednesday",
  wednesday: "Wednesday",
  wed: "Wednesday",
  "الخميس": "Thursday",
  thursday: "Thursday",
  thu: "Thursday",
  "الجمعة": "Friday",
  friday: "Friday",
};

/** Arabic-Indic (٠-٩) and Persian (۰-۹) digits -> ASCII, plus NBSP/odd-whitespace cleanup. */
function normalizeText(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[ ‏‎]/g, " ")
    .trim();
}

function normalizeHeader(header: string): string {
  return normalizeText(header).toLowerCase();
}

/** Builds a lookup from canonical field name -> the actual header found in the sheet. */
function resolveHeaderMap(headers: string[]): Record<string, string> {
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const map: Record<string, string> = {};

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    // Exact match first, then fall back to "header contains alias" / "alias
    // contains header" so real-world headers like "كود المادة *" or
    // "Course Code (unique)" still resolve.
    const exact = normalized.find((h) => aliases.includes(h.norm));
    const fuzzy =
      exact ??
      normalized.find((h) =>
        aliases.some((alias) => h.norm.includes(alias) || alias.includes(h.norm))
      );
    if (fuzzy) map[field] = fuzzy.raw;
  }

  const prereqFound =
    normalized.find((h) => PREREQ_ALIASES.includes(h.norm)) ??
    normalized.find((h) => PREREQ_ALIASES.some((alias) => h.norm.includes(alias)));
  if (prereqFound) map.prerequisites = prereqFound.raw;

  return map;
}

function normalizeDay(value: string): string | null {
  const key = normalizeText(value).toLowerCase();
  return DAY_ALIASES[key] ?? null;
}

/**
 * Accepts "10:00", "9:5", "10:00:00", "10:00 AM/PM" (with or without
 * seconds), "10:00 ص/م", a bare Excel time fraction ("0.375"), or a raw
 * numeric time serial — Excel/SheetJS can hand back any of these depending
 * on how the source cell was formatted.
 */
function normalizeTime(value: unknown): string | null {
  if (typeof value === "number") {
    return minutesToHHmm(Math.round((value % 1) * 24 * 60));
  }

  if (typeof value !== "string") return null;
  const raw = normalizeText(value);
  if (!raw) return null;

  const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm|ص|م)$/i);
  if (ampmMatch) {
    const [, h, m, period] = ampmMatch;
    let hour = Number(h);
    const isPM = /pm|م/i.test(period);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    const formatted = `${String(hour).padStart(2, "0")}:${m}`;
    return isValidTime(formatted) ? formatted : null;
  }

  const plainMatch = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (plainMatch) {
    const formatted = `${plainMatch[1].padStart(2, "0")}:${plainMatch[2]}`;
    return isValidTime(formatted) ? formatted : null;
  }

  // A bare decimal like "0.375" — the cell held a time serial but wasn't
  // formatted as a time by Excel, so SheetJS returned the raw fraction as text.
  const decimalMatch = raw.match(/^0?\.\d+$/);
  if (decimalMatch) {
    return minutesToHHmm(Math.round(Number(raw) * 24 * 60));
  }

  return null;
}

function minutesToHHmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function splitPrerequisites(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return normalizeText(value)
    .split(/[,،]/)
    .map((code) => code.trim())
    .filter(Boolean);
}

function readCell(row: RawRow, header: string | undefined): unknown {
  if (!header) return undefined;
  return row[header];
}

function readText(row: RawRow, header: string | undefined): string {
  const value = readCell(row, header);
  return typeof value === "string" ? normalizeText(value) : String(value ?? "").trim();
}

function parseCreditHours(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return NaN;
  // Strip anything but digits/decimal point, e.g. "3 ساعات" -> "3".
  const digitsOnly = normalizeText(value).match(/[\d.]+/);
  return digitsOnly ? Number(digitsOnly[0]) : NaN;
}

export function parseCourseWorkbook(buffer: ArrayBuffer): ParseResult {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<RawRow>(sheet, {
    raw: false,
    defval: "",
  });

  if (rawRows.length === 0) {
    return { rows: [], errors: [{ row: 1, message: "الملف فارغ أو بدون صفوف بيانات" }] };
  }

  const headerMap = resolveHeaderMap(Object.keys(rawRows[0]));

  const requiredFields: (keyof typeof HEADER_ALIASES)[] = [
    "courseCode",
    "courseName",
    "creditHours",
    "day",
    "startTime",
    "endTime",
  ];
  const missingHeaders = requiredFields.filter((f) => !headerMap[f]);
  if (missingHeaders.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: `أعمدة مفقودة في الملف: ${missingHeaders.join(", ")}`,
        },
      ],
    };
  }

  const rows: ParsedCourseRow[] = [];
  const errors: RowError[] = [];

  rawRows.forEach((raw, index) => {
    const spreadsheetRow = index + 2; // +1 for 0-index, +1 for header row
    const problems: string[] = [];

    const courseCode = readText(raw, headerMap.courseCode);
    const courseName = readText(raw, headerMap.courseName);
    const creditHours = parseCreditHours(readCell(raw, headerMap.creditHours));
    const dayRaw = readText(raw, headerMap.day);
    const day = normalizeDay(dayRaw);
    const startTime = normalizeTime(readCell(raw, headerMap.startTime));
    const endTime = normalizeTime(readCell(raw, headerMap.endTime));
    const section = headerMap.section ? readText(raw, headerMap.section) || null : null;
    const instructor = headerMap.instructor ? readText(raw, headerMap.instructor) || null : null;
    const room = headerMap.room ? readText(raw, headerMap.room) || null : null;
    const prerequisites = splitPrerequisites(readCell(raw, headerMap.prerequisites));

    if (!courseCode) problems.push("كود المادة مفقود");
    if (!courseName) problems.push("اسم المادة مفقود");
    if (!Number.isFinite(creditHours) || creditHours <= 0) {
      problems.push("عدد الساعات غير صحيح");
    }
    if (!day) problems.push(`اليوم غير معروف: "${dayRaw}"`);
    if (!startTime) problems.push("وقت البداية غير صحيح (المتوقع HH:mm)");
    if (!endTime) problems.push("وقت النهاية غير صحيح (المتوقع HH:mm)");
    if (startTime && endTime && startTime >= endTime) {
      problems.push("وقت البداية لازم يكون قبل وقت النهاية");
    }

    if (problems.length > 0) {
      errors.push({ row: spreadsheetRow, message: problems.join(" / ") });
      return;
    }

    rows.push({
      courseCode,
      courseName,
      creditHours,
      section,
      instructor,
      room,
      day: day as string,
      startTime: startTime as string,
      endTime: endTime as string,
      prerequisites,
    });
  });

  return { rows, errors };
}
