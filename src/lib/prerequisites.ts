import type { CourseDTO } from "@/types/course";

interface CodeAndName {
  courseCode: string;
  courseName: string;
}

/** courseCode -> courseName. `fallback` (e.g. the full curriculum) fills in
 * names for codes that aren't in `primary` (e.g. this term's offered sections). */
export function buildCourseNameMap(
  primary: CodeAndName[],
  fallback: CodeAndName[] = []
): Map<string, string> {
  const map = new Map<string, string>();
  for (const course of fallback) {
    if (!map.has(course.courseCode)) map.set(course.courseCode, course.courseName);
  }
  for (const course of primary) {
    map.set(course.courseCode, course.courseName);
  }
  return map;
}

export function missingPrerequisites(
  course: CourseDTO,
  completedCourseCodes: Set<string>
): string[] {
  return course.prerequisites.filter((code) => !completedCourseCodes.has(code));
}

export function isCourseUnlocked(
  course: CourseDTO,
  completedCourseCodes: Set<string>
): boolean {
  return missingPrerequisites(course, completedCourseCodes).length === 0;
}

/**
 * Overrides each course's `prerequisites` with the curriculum's authoritative
 * chain (keyed by courseCode) when available, falling back to whatever the
 * admin's Excel upload set on the Course row itself.
 */
export function withCurriculumPrerequisites(
  courses: CourseDTO[],
  curriculumPrereqs: Map<string, string[]>
): CourseDTO[] {
  return courses.map((course) => {
    const curriculumOnes = curriculumPrereqs.get(course.courseCode);
    return curriculumOnes ? { ...course, prerequisites: curriculumOnes } : course;
  });
}
