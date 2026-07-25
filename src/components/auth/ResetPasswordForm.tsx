"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const password = form.get("password") as string;
    const confirmPassword = form.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("الباسورد وتأكيد الباسورد مش متطابقين");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "حصل خطأ، حاول تاني");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (!token) {
    return <Alert tone="danger">اللينك ده مش صحيح. اطلب لينك جديد من صفحة نسيت الباسورد.</Alert>;
  }

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="success">تم تغيير الباسورد بنجاح.</Alert>
        <Link href="/student/login">
          <Button type="button" className="w-full">
            تسجيل الدخول
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <Input id="password" name="password" type="password" label="الباسورد الجديد" required />
      <Input
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="تأكيد الباسورد"
        required
      />

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "جاري الحفظ..." : "تغيير الباسورد"}
      </Button>
    </form>
  );
}
