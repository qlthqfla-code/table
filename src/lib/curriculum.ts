/**
 * Parses the raw flowsheet JSON (see prisma/curriculum/*.json, sourced from
 * https://github.com/shadowzxcv/subjects-modern-academy) into flat Subject
 * rows ready to seed the DB. Each top-level array entry is one term; each
 * term holds either a plain course or an elective group (`optionalSet` +
 * `list`) — we flatten electives into individual, independently-completable
 * subjects and drop the grouping metadata (choosing "exactly one of N" is
 * not enforced, only tracked as pass/fail per subject).
 */

export interface RawSubjectEntry {
  semester: number;
  id: string;
  subjectName: string;
  creditHours: number;
  requirements: string[];
  type?: number;
  conditions?: string[];
}

interface RawElectiveGroup {
  semester: number;
  id: number;
  optionalSet: string[];
  list: RawSubjectEntry[];
}

type RawTermEntry = RawSubjectEntry | RawElectiveGroup;
export type RawCurriculum = RawTermEntry[][];

export interface NormalizedSubject {
  courseCode: string;
  courseName: string;
  creditHours: number;
  semester: number;
  isTraining: boolean;
  prerequisites: string[];
  conditions: string[];
}

function isElectiveGroup(entry: RawTermEntry): entry is RawElectiveGroup {
  return Array.isArray((entry as RawElectiveGroup).list);
}

export function flattenCurriculum(raw: RawCurriculum): NormalizedSubject[] {
  const subjects: NormalizedSubject[] = [];

  for (const term of raw) {
    for (const entry of term) {
      const items = isElectiveGroup(entry) ? entry.list : [entry];
      for (const item of items) {
        subjects.push({
          courseCode: item.id,
          courseName: item.subjectName.trim(),
          creditHours: item.creditHours,
          semester: item.semester,
          isTraining: item.type === 1,
          prerequisites: item.requirements ?? [],
          conditions: item.conditions ?? [],
        });
      }
    }
  }

  return subjects;
}

/** 1..10 -> 1..5 (two semesters per academic year). */
export function semesterToYear(semester: number): number {
  return Math.ceil(semester / 2);
}

/** Odd semester numbers are Fall, even are Spring (standard convention; not asserted by the source data). */
export function semesterToTerm(semester: number): "Fall" | "Spring" {
  return semester % 2 === 1 ? "Fall" : "Spring";
}

export const YEAR_LABELS_AR = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة"];
export const TERM_LABELS_AR: Record<"Fall" | "Spring", string> = {
  Fall: "الفصل الأول",
  Spring: "الفصل الثاني",
};

// Mirrors the Prisma `Department` enum as a plain string union so this file
// stays importable from Client Components (which can't pull in @prisma/client).
export type Department = "Computer" | "Communication" | "Architecture" | "Civil";

export const DEPARTMENTS: { value: Department; label: string; curriculumFile: string }[] = [
  { value: "Computer", label: "هندسة الحاسبات", curriculumFile: "computer-engineering" },
  { value: "Communication", label: "هندسة الاتصالات", curriculumFile: "communication-engineering" },
  { value: "Architecture", label: "الهندسة المعمارية", curriculumFile: "architecture-engineering" },
  { value: "Civil", label: "الهندسة المدنية", curriculumFile: "civil-engineering" },
];

export const DEPARTMENT_LABELS_AR: Record<Department, string> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.value, d.label])
) as Record<Department, string>;
