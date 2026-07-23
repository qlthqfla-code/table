import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { CompletedCoursesPicker } from "@/components/onboarding/CompletedCoursesPicker";
import { DEPARTMENT_LABELS_AR, semesterToTerm, semesterToYear } from "@/lib/curriculum";

export default async function CompletedCoursesOnboardingPage() {
  const session = await getSession();

  const student = await prisma.student.findUnique({
    where: { id: session!.id },
    select: { department: true, completedCourseCodes: true },
  });

  // Session cookie points at a student row that no longer exists (e.g. a
  // stale cookie from a wiped dev database) — send them to log in again.
  if (!student) {
    redirect("/student/login");
  }

  const subjects = await prisma.subject.findMany({
    where: { department: student.department },
    orderBy: { semester: "asc" },
  });

  const gridSubjects = subjects.map((s) => ({
    courseCode: s.courseCode,
    courseName: s.courseName,
    creditHours: s.creditHours,
    isTraining: s.isTraining,
    year: semesterToYear(s.semester),
    term: semesterToTerm(s.semester),
  }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-950">المواد اللي خلصتها</h1>
        <p className="mt-1 text-sm text-primary-500">
          حدد من منهج {DEPARTMENT_LABELS_AR[student.department]} تحت المواد اللي عديتها قبل
          كده. هنستخدمها عشان نوضحلك المواد المتاحة ليك دلوقتي بناءً على متطلباتها السابقة.
        </p>
      </div>

      <Card className="overflow-x-auto">
        <CompletedCoursesPicker
          subjects={gridSubjects}
          initialSelected={student.completedCourseCodes}
        />
      </Card>
    </div>
  );
}
