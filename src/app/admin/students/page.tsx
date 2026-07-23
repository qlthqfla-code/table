import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { StudentTable } from "@/components/admin/StudentTable";

export default async function AdminStudentsPage() {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      universityId: true,
      department: true,
      createdAt: true,
    },
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-950">الطلاب المسجلين</h1>
          <p className="mt-1 text-sm text-primary-500">كل الطلاب اللي عملوا حساب في الموقع.</p>
        </div>
        <Link href="/admin" className="text-sm font-medium text-primary-700 hover:underline">
          رجوع للوحة التحكم
        </Link>
      </div>

      <Card>
        {students.length === 0 ? (
          <p className="text-center text-sm text-primary-400">لسه مفيش طلاب مسجلين.</p>
        ) : (
          <StudentTable
            students={students.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
          />
        )}
      </Card>
    </div>
  );
}
