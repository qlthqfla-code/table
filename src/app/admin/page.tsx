import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/admin/StatCard";
import { AdminCoursesByDepartment } from "@/components/admin/AdminCoursesByDepartment";
import { DAY_ORDER } from "@/lib/time";
import { semesterToYear } from "@/lib/curriculum";

export default async function AdminDashboardPage() {
  const [courses, distinctCourses, totalStudents, subjects] = await Promise.all([
    prisma.course.findMany({ orderBy: [{ courseName: "asc" }, { lectureStartTime: "asc" }] }),
    prisma.course.findMany({ distinct: ["courseCode"], select: { courseCode: true } }),
    prisma.student.count(),
    prisma.subject.findMany({ select: { department: true, courseCode: true, semester: true } }),
  ]);

  // (department, courseCode) -> curriculum year, used to group each
  // department's table below by level.
  const yearByDeptAndCode = new Map<string, number>();
  for (const subject of subjects) {
    yearByDeptAndCode.set(
      `${subject.department}:${subject.courseCode}`,
      semesterToYear(subject.semester)
    );
  }

  const dayIndex = (day: string) => DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);

  const sortedCourses = courses
    .map((course) => ({
      ...course,
      year: yearByDeptAndCode.get(`${course.department}:${course.courseCode}`) ?? null,
    }))
    .sort((a, b) => {
      const yearDiff = (a.year ?? Infinity) - (b.year ?? Infinity);
      if (yearDiff !== 0) return yearDiff;
      const nameDiff = a.courseName.localeCompare(b.courseName, "en");
      if (nameDiff !== 0) return nameDiff;
      const sectionDiff = Number(a.section) - Number(b.section);
      if (!Number.isNaN(sectionDiff) && sectionDiff !== 0) return sectionDiff;
      return dayIndex(a.lectureDay) - dayIndex(b.lectureDay);
    });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-950">لوحة تحكم الأدمن</h1>
        <p className="mt-1 text-sm text-primary-500">
          كل قسم ليه جدول مواد مستقل — ارفع ملف Excel لكل قسم على حدة، وأي رفع جديد بيستبدل جدول القسم ده بس.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          value={courses.length}
          label="شعبة/سكشن (كل الأقسام)"
          tone="primary"
          icon={
            <path
              d="M4 6h16M4 12h16M4 18h10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          }
        />
        <StatCard
          value={distinctCourses.length}
          label="مادة مختلفة (كل الأقسام)"
          tone="accent"
          icon={
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          }
        />
        <Link href="/admin/students">
          <StatCard
            value={totalStudents}
            label="طالب مسجل — اضغط للعرض"
            tone="success"
            clickable
            icon={
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            }
          />
        </Link>
      </div>

      <Card>
        <AdminCoursesByDepartment courses={sortedCourses} />
      </Card>
    </div>
  );
}
