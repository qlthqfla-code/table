"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "حصل خطأ، حاول تاني");
        setLoading(false);
        return;
      }

      router.push(data.role === "admin" ? "/admin" : "/schedule");
      router.refresh();
    } catch {
      setError("تعذر الاتصال بالسيرفر، تأكد من الإنترنت وحاول تاني");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <Input id="email" name="email" type="email" label="الإيميل" required />
      <Input
        id="password"
        name="password"
        type="password"
        label="الباسورد"
        required
      />

      <Link
        href="/forgot-password"
        className="self-end text-xs font-medium text-primary-600 hover:underline"
      >
        نسيت الباسورد؟
      </Link>

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "جاري الدخول..." : "تسجيل الدخول"}
      </Button>
    </form>
  );
}
