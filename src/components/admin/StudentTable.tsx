"use client";

import { useMemo, useState } from "react";
import { DEPARTMENT_LABELS_AR, type Department } from "@/lib/curriculum";

export interface AdminStudentRow {
  id: string;
  fullName: string;
  email: string;
  universityId: string;
  department: Department;
  createdAt: string;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function StudentTable({ students }: { students: AdminStudentRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return students;
    return students.filter(
      (s) =>
        normalize(s.fullName).includes(q) ||
        normalize(s.email).includes(q) ||
        s.universityId.includes(q)
    );
  }, [students, query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="دوّر بالاسم أو الإيميل أو الرقم الجامعي..."
        className="w-full rounded-lg border border-primary-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />

      <p className="text-xs text-primary-400">
        {filtered.length} من {students.length} طالب
      </p>

      <div className="max-h-[36rem] overflow-auto rounded-lg border border-primary-100">
        <table className="w-full min-w-[640px] text-right text-sm">
          <thead className="sticky top-0 bg-primary-800 text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">الاسم</th>
              <th className="px-3 py-2 font-semibold">الإيميل</th>
              <th className="px-3 py-2 font-semibold">الرقم الجامعي</th>
              <th className="px-3 py-2 font-semibold">القسم</th>
              <th className="px-3 py-2 font-semibold">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-primary-400">
                  مفيش نتائج
                </td>
              </tr>
            )}
            {filtered.map((student) => (
              <tr key={student.id} className="hover:bg-primary-50/60">
                <td className="px-3 py-2 font-medium text-primary-900">{student.fullName}</td>
                <td className="px-3 py-2 text-primary-500">{student.email}</td>
                <td className="whitespace-nowrap px-3 py-2 text-primary-500">
                  {student.universityId}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-primary-500">
                  {DEPARTMENT_LABELS_AR[student.department]}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-primary-400">
                  {new Date(student.createdAt).toLocaleDateString("ar-EG")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
