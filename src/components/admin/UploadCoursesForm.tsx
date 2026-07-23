"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { Department } from "@/lib/curriculum";

interface RowError {
  row: number;
  message: string;
}

interface UploadResult {
  added: number;
  skipped: number;
  rowErrors: RowError[];
}

export function UploadCoursesForm({ department }: { department: Department }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputId = `course-file-${department}`;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("اختار ملف Excel الأول");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", department);

    const res = await fetch("/api/admin/courses/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "حصل خطأ أثناء رفع الملف");
      if (data.rowErrors) setResult({ added: 0, skipped: data.rowErrors.length, rowErrors: data.rowErrors });
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
    setFileName(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      {result && (
        <Alert tone={result.added > 0 ? "success" : "warning"}>
          {result.added > 0 && <p>تم إضافة {result.added} مادة بنجاح.</p>}
          {result.skipped > 0 && (
            <p>{result.skipped} صف اتجاهل بسبب بيانات ناقصة أو غير صحيحة.</p>
          )}
        </Alert>
      )}

      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 px-6 py-10 text-center transition-colors hover:border-primary-400"
      >
        <span className="text-sm font-medium text-primary-700">
          {fileName ?? "اضغط لاختيار ملف Excel (xlsx / xls)"}
        </span>
        <span className="text-xs text-primary-400">
          الملف لازم يحتوي على: اسم المادة، كود المادة، عدد الساعات، اليوم، وقت البداية، وقت النهاية
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "جاري الرفع..." : "رفع واستبدال جدول القسم ده"}
      </Button>

      {result && result.rowErrors.length > 0 && (
        <div className="mt-2 max-h-72 overflow-y-auto rounded-lg border border-danger-100">
          <table className="w-full text-right text-sm">
            <thead className="bg-danger-50 text-danger-700">
              <tr>
                <th className="px-3 py-2 font-semibold">الصف</th>
                <th className="px-3 py-2 font-semibold">المشكلة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-danger-50">
              {result.rowErrors.map((rowError) => (
                <tr key={rowError.row}>
                  <td className="px-3 py-2 text-primary-900">{rowError.row}</td>
                  <td className="px-3 py-2 text-danger-600">{rowError.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </form>
  );
}
