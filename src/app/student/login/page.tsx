import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginIcon } from "@/components/auth/icons";

export default function LoginPage() {
  return (
    <AuthCard
      title="تسجيل الدخول"
      icon={<LoginIcon />}
      footer={
        <span className="text-primary-500">
          لسه معملتش حساب؟{" "}
          <Link href="/student/register" className="font-semibold text-primary-700 hover:underline">
            إنشاء حساب جديد
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
