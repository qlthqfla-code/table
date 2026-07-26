import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { KeyIcon } from "@/components/auth/icons";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="نسيت الباسورد؟"
      subtitle="اكتب إيميلك وهنبعتلك لينك تعمل بيه باسورد جديد."
      icon={<KeyIcon />}
      footer={
        <Link href="/student/login" className="font-semibold text-primary-700 hover:underline">
          رجوع لتسجيل الدخول
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
