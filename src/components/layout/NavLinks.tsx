import type { Role } from "@/lib/auth";
import { NavLink } from "@/components/layout/NavLink";
import { LogoutButton } from "@/components/layout/LogoutButton";

export function NavLinks({
  role,
  onNavigate,
  className = "",
}: {
  role: Role | null;
  onNavigate?: () => void;
  className?: string;
}) {
  if (role === "student") {
    return (
      <div className={className}>
        <NavLink href="/schedule" onClick={onNavigate}>
          جدولي
        </NavLink>
        <NavLink href="/onboarding/completed-courses" onClick={onNavigate}>
          المواد المخلّصة
        </NavLink>
        <LogoutButton />
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className={className}>
        <NavLink href="/admin" onClick={onNavigate}>
          لوحة التحكم
        </NavLink>
        <NavLink href="/admin/students" onClick={onNavigate}>
          الطلاب
        </NavLink>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className={className}>
      <NavLink href="/student/login" onClick={onNavigate}>
        دخول الطلاب
      </NavLink>
      <NavLink
        href="/student/register"
        onClick={onNavigate}
        className="!bg-primary-600 !px-4 !py-2 !text-white shadow-sm transition-colors hover:!bg-primary-700 hover:!text-white"
      >
        إنشاء حساب
      </NavLink>
    </div>
  );
}
