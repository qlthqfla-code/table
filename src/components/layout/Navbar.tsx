import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/layout/Logo";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ProfileMenu, type StudentProfile } from "@/components/layout/ProfileMenu";

export async function Navbar() {
  const session = await getSession();
  const role = session?.role ?? null;

  let studentProfile: StudentProfile | null = null;
  if (role === "student") {
    studentProfile = await prisma.student.findUnique({
      where: { id: session!.id },
      select: { fullName: true, universityId: true, department: true, gpa: true },
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/90 backdrop-blur">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-4 sm:flex sm:gap-6">
          {studentProfile && <ProfileMenu profile={studentProfile} />}
          <NavLinks role={role} className="flex items-center gap-4 sm:gap-6" />
        </div>
        <MobileMenu role={role} studentProfile={studentProfile} />
      </div>
    </header>
  );
}
