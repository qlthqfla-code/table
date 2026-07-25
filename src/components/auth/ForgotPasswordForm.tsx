"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "حصل خطأ، حاول تاني");
    } else {
      setMessage(data.message);
    }
    setLoading(false);
  }

  if (message) {
    return <Alert tone="success">{message}</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert tone="danger">{error}</Alert>}

      <Input id="email" name="email" type="email" label="الإيميل" required />

      <Button type="submit" disabled={loading} className="mt-2 w-full">
        {loading ? "جاري الإرسال..." : "ابعت لينك إعادة التعيين"}
      </Button>
    </form>
  );
}
