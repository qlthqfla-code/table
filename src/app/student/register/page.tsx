import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { StudentRegisterForm } from "@/components/auth/StudentRegisterForm";
import { RegisterIcon } from "@/components/auth/icons";

export default function StudentRegisterPage() {
  return (
    <AuthCard
      title="إنشاء حساب طالب"
      subtitle="عشان تقدر تبني جدولك الدراسي"
      icon={<RegisterIcon />}
      wide
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
