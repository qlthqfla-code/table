"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DEPARTMENTS } from "@/lib/curriculum";

export function StudentRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      universityId: form.get("universityId"),
      password: form.get("password"),
      department: form.get("department"),
      gpa: form.get("gpa"),
    };

    try {
      const res = await fetch("/api/auth/student/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "حصل خطأ، حاول تاني");
        setLoading(false);
        return;
      }

      router.push("/schedule");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالسيرفر، تأكد من الإنترنت وحاول تاني");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <Input id="fullName" name="fullName" label="الاسم بالكامل" required />
      <Input
        id="email"
        name="email"
        type="email"
        label="الإيميل"
        required
      />
      <Input
        id="universityId"
        name="universityId"
        label="الرقم الجامعي (7 أرقام)"
        inputMode="numeric"
        pattern="\d{7}"
        maxLength={7}
        title="الرقم الجامعي لازم يكون 7 أرقام بالظبط"
        placeholder="مثال: 2210123"
        required
      />
      <Select id="department" name="department" label="القسم" defaultValue="" required>
        <option value="" disabled>
          اختار القسم
        </option>
        {DEPARTMENTS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>
      <Input
        id="gpa"
        name="gpa"
        type="number"
        step="0.01"
        min={0}
        max={4}
        label="المعدل التراكمي GPA (من 4)"
        placeholder="مثال: 3.2"
        title="الـ GPA لازم يكون رقم من 0 لـ 4"
        required
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="الباسورد"
        minLength={6}
        required
      />

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "جاري الإنشاء..." : "إنشاء الحساب"}
      </Button>
    </form>
  );
}
