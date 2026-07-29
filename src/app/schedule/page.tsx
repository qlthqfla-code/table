import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ScheduleBuilder } from "@/components/schedule/ScheduleBuilder";
import { withCurriculumPrerequisites } from "@/lib/prerequisites";
import { semesterToYear } from "@/lib/curriculum";
import { SECTION_CAPACITY } from "@/lib/capacity";
import type { CourseDTO } from "@/types/course";

export default async function SchedulePage() {
  const session = await getSession();

  const student = await prisma.student.findUnique({
    where: { id: session!.id },
    select: { department: true, completedCourseCodes: true, gpa: true },
  });

  // Session cookie points at a student row that no longer exists (e.g. a
  // stale cookie from a wiped dev database) — send them to log in again.
  if (!student) {
    redirect("/student/login");
  }

  const [courses, existingSchedule, subjects, enrollmentCounts] = await Promise.all([
    prisma.course.findMany({
      where: { department: student.department },
      orderBy: [{ courseName: "asc" }, { lectureStartTime: "asc" }],
    }),
    prisma.studentSchedule.findFirst({
      where: { studentId: session!.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { course: true } } },
    }),
    prisma.subject.findMany({
      where: { department: student.department },
      select: { courseCode: true, courseName: true, prerequisites: true, semester: true },
    }),
    // Other students' seat counts per section — excludes this student's own
    // pick so a full section never disappears out from under the person
    // already holding a seat in it.
    prisma.studentScheduleItem.groupBy({
      by: ["courseId"],
      where: {
        course: { department: student.department },
        schedule: { studentId: { not: session!.id } },
      },
      _count: { _all: true },
    }),
  ]);

  const fullCourseIds = enrollmentCounts
    .filter((row) => row._count._all >= SECTION_CAPACITY)
    .map((row) => row.courseId);

  const curriculumPrereqs = new Map(subjects.map((s) => [s.courseCode, s.prerequisites]));
  const yearByCourseCode = new Map(subjects.map((s) => [s.courseCode, semesterToYear(s.semester)]));
  const withYear = (list: CourseDTO[]) =>
    list.map((c) => ({ ...c, year: yearByCourseCode.get(c.courseCode) ?? null }));

  const allCourses: CourseDTO[] = withYear(withCurriculumPrerequisites(courses, curriculumPrereqs));
  const initialSelected: CourseDTO[] = existingSchedule
    ? withYear(
        withCurriculumPrerequisites(
          existingSchedule.items.map((item) => item.course),
          curriculumPrereqs
        )
      )
    : [];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">بناء الجدول الدراسي</h1>
          <p className="mt-1 text-sm text-primary-500">
            اختار المواد اللي عايز تسجلها، وهنكتشف أي تعارض في المواعيد قبل ما تأكد جدولك.
          </p>
        </div>
        <Link
          href="/onboarding/completed-courses"
          className="text-sm font-medium text-primary-700 hover:underline"
        >
          عدّل المواد اللي خلصتها
        </Link>
      </div>

      {allCourses.length === 0 ? (
        <p className="rounded-lg border border-primary-100 bg-white p-6 text-center text-sm text-primary-500">
          لسه مفيش جدول مواد متاح. استنى الأدمن يرفع جدول المواد.
        </p>
      ) : (
        <ScheduleBuilder
          allCourses={allCourses}
          initialSelected={initialSelected}
          completedCourseCodes={student.completedCourseCodes}
          gpa={student.gpa}
          fullCourseIds={fullCourseIds}
        />
      )}
    </div>
  );
}
