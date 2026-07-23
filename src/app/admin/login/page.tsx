import { AuthCard } from "@/components/auth/AuthCard";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <AuthCard title="دخول الأدمن" subtitle="لوحة تحكم الأكاديمية">
      <AdminLoginForm />
    </AuthCard>
  );
}
