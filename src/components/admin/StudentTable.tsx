"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEPARTMENT_LABELS_AR, type Department } from "@/lib/curriculum";
import { Alert } from "@/components/ui/Alert";

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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "تعذر حذف الطالب");
      }
      setConfirmingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حذف الطالب");
    } finally {
      setDeletingId(null);
    }
  }

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

      {error && <Alert tone="danger">{error}</Alert>}

      <div className="max-h-[36rem] overflow-auto rounded-lg border border-primary-100">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead className="sticky top-0 bg-primary-800 text-white">
            <tr>
              <th className="px-3 py-2 font-semibold">الاسم</th>
              <th className="px-3 py-2 font-semibold">الإيميل</th>
              <th className="px-3 py-2 font-semibold">الرقم الجامعي</th>
              <th className="px-3 py-2 font-semibold">القسم</th>
              <th className="px-3 py-2 font-semibold">تاريخ التسجيل</th>
              <th className="px-3 py-2 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-primary-400">
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
                <td className="whitespace-nowrap px-3 py-2">
                  {confirmingId === student.id ? (
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(student.id)}
                        disabled={deletingId === student.id}
                        className="rounded-md bg-danger-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-danger-700 disabled:opacity-60"
                      >
                        {deletingId === student.id ? "جاري الحذف..." : "تأكيد الحذف"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(null)}
                        disabled={deletingId === student.id}
                        className="rounded-md border border-primary-200 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(student.id)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-danger-600 hover:bg-danger-50"
                    >
                      حذف
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
