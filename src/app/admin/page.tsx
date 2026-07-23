import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminCoursesByDepartment } from "@/components/admin/AdminCoursesByDepartment";
import { DAY_ORDER } from "@/lib/time";
import { semesterToYear } from "@/lib/curriculum";

export default async function AdminDashboardPage() {
  const [courses, distinctCourses, totalStudents, subjects] = await Promise.all([
    prisma.course.findMany({ orderBy: [{ courseName: "asc" }, { startTime: "asc" }] }),
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
      return dayIndex(a.day) - dayIndex(b.day);
    });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-950">لوحة تحكم الأدمن</h1>
        <p className="mt-1 text-sm text-primary-500">
          كل قسم ليه جدول مواد مستقل — ارفع ملف Excel لكل قسم على حدة، وأي رفع جديد بيستبدل جدول القسم ده بس.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-900">{courses.length}</p>
          <p className="text-xs text-primary-500">شعبة/سكشن (كل الأقسام)</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-900">{distinctCourses.length}</p>
          <p className="text-xs text-primary-500">مادة مختلفة (كل الأقسام)</p>
        </Card>
        <Link href="/admin/students">
          <Card className="text-center transition-shadow hover:shadow-md">
            <p className="text-2xl font-bold text-primary-900">{totalStudents}</p>
            <p className="text-xs text-primary-500">طالب مسجل — اضغط للعرض</p>
          </Card>
        </Link>
      </div>

      <Card>
        <AdminCoursesByDepartment courses={sortedCourses} />
      </Card>
    </div>
  );
}
