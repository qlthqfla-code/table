import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";

export default function StudentLoginPage() {
  return (
    <AuthCard
      title="تسجيل دخول الطلاب"
      footer={
        <span className="text-primary-500">
          لسه معملتش حساب؟{" "}
          <Link href="/student/register" className="font-semibold text-primary-700 hover:underline">
            إنشاء حساب جديد
          </Link>
        </span>
      }
    >
      <StudentLoginForm />
    </AuthCard>
  );
}
