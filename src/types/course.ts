export interface CourseDTO {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  prerequisites: string[];
  section: string | null;
  instructor: string | null;

  lectureDay: string;
  lectureStartTime: string;
  lectureEndTime: string;
  lectureRoom: string | null;

  sectionDay: string;
  sectionStartTime: string;
  sectionEndTime: string;
  sectionRoom: string | null;

  /** Curriculum year (1-5), when the courseCode is found in the student's Subject catalog. */
  year?: number | null;
}

/** A course meets twice a week — one block for the lecture, one for the "تطبيق". */
export type CourseBlockKind = "lecture" | "section";

export interface CourseBlock {
  kind: CourseBlockKind;
  day: string;
  startTime: string;
  endTime: string;
}

export function courseBlocks(course: CourseDTO): CourseBlock[] {
  return [
    { kind: "lecture", day: course.lectureDay, startTime: course.lectureStartTime, endTime: course.lectureEndTime },
    { kind: "section", day: course.sectionDay, startTime: course.sectionStartTime, endTime: course.sectionEndTime },
  ];
}

export const BLOCK_KIND_LABELS_AR: Record<CourseBlockKind, string> = {
  lecture: "محاضرة",
  section: "تطبيق",
};

export interface ConflictDetail {
  courseA: CourseDTO;
  courseB: CourseDTO;
  blockA: CourseBlock;
  blockB: CourseBlock;
}

export interface AlternativeSuggestion {
  /** The conflicting course this alternative would replace. */
  replaces: CourseDTO;
  /** Another section of the same courseCode with non-conflicting lecture/section times. */
  alternative: CourseDTO;
}
