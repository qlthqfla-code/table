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
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputId = `course-file-${department}`;

  function requestUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inputRef.current?.files?.[0]) {
      setError("اختار ملف Excel الأول");
      return;
    }
    setError(null);
    setResult(null);
    setConfirming(true);
  }

  async function performUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setConfirming(false);
      setError("اختار ملف Excel الأول");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("department", department);

    try {
      const res = await fetch("/api/admin/courses/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "حصل خطأ أثناء رفع الملف");
        if (data.rowErrors) setResult({ added: 0, skipped: data.rowErrors.length, rowErrors: data.rowErrors });
        setLoading(false);
        setConfirming(false);
        return;
      }

      setResult(data);
      setLoading(false);
      setConfirming(false);
      if (inputRef.current) inputRef.current.value = "";
      setFileName(null);
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالسيرفر، تأكد من الإنترنت وحاول تاني");
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <form onSubmit={requestUpload} className="flex flex-col gap-4">
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
          onChange={(e) => {
            setFileName(e.target.files?.[0]?.name ?? null);
            setConfirming(false);
          }}
        />
      </label>

      {confirming ? (
        <div className="flex flex-col gap-2 rounded-xl border-2 border-danger-500 bg-danger-50 p-4">
          <p className="text-sm font-semibold text-danger-700">
            متأكد؟ ده هيمسح جدول القسم ده الحالي بالكامل ويستبدله بالملف ده — أي شعبة مسجلة عند
            طلاب دلوقتي هتتشال من جداولهم.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="danger"
              disabled={loading}
              className="flex-1"
              onClick={performUpload}
            >
              {loading ? "جاري الرفع..." : "تأكيد الرفع والاستبدال"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => setConfirming(false)}
            >
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" className="w-full">
          رفع واستبدال جدول القسم ده
        </Button>
      )}

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
