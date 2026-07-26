import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ResetIcon } from "@/components/auth/icons";

function FormSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-[62px] rounded-lg bg-primary-50" />
      <div className="h-[62px] rounded-lg bg-primary-50" />
      <div className="mt-2 h-[42px] rounded-lg bg-primary-100" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard title="إعادة تعيين الباسورد" icon={<ResetIcon />}>
      <Suspense fallback={<FormSkeleton />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
