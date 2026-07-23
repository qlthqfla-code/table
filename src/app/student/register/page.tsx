import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { StudentRegisterForm } from "@/components/auth/StudentRegisterForm";

export default function StudentRegisterPage() {
  return (
    <AuthCard
      title="إنشاء حساب طالب"
      subtitle="عشان تقدر تبني جدولك الدراسي"
      footer={
        <span className="text-primary-500">
          عندك حساب بالفعل؟{" "}
          <Link href="/student/login" className="font-semibold text-primary-700 hover:underline">
            تسجيل الدخول
          </Link>
        </span>
      }
    >
      <StudentRegisterForm />
    </AuthCard>
  );
}
