export interface CourseDTO {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  prerequisites: string[];
  section: string | null;
  instructor: string | null;
  room: string | null;
  day: string;
  startTime: string;
  endTime: string;
  /** Curriculum year (1-5), when the courseCode is found in the student's Subject catalog. */
  year?: number | null;
}

export interface ConflictDetail {
  courseA: CourseDTO;
  courseB: CourseDTO;
}

export interface AlternativeSuggestion {
  /** The conflicting course this alternative would replace. */
  replaces: CourseDTO;
  /** Another section of the same courseCode with a non-conflicting time. */
  alternative: CourseDTO;
}
