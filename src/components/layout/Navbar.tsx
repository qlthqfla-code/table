import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevelForHours } from "@/lib/level";
import { Logo } from "@/components/layout/Logo";
import { NavLinks } from "@/components/layout/NavLinks";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { ProfileMenu, type StudentProfile } from "@/components/layout/ProfileMenu";
import { StickyHeader } from "@/components/layout/StickyHeader";

export async function Navbar() {
  const session = await getSession();
  const role = session?.role ?? null;

  let studentProfile: StudentProfile | null = null;
  if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: session!.id },
      select: {
        fullName: true,
        universityId: true,
        department: true,
        gpa: true,
        completedCourseCodes: true,
      },
    });

    if (student) {
      const completedSubjects = await prisma.subject.findMany({
        where: { department: student.department, courseCode: { in: student.completedCourseCodes } },
        select: { creditHours: true },
      });
      const completedHours = completedSubjects.reduce((sum, s) => sum + s.creditHours, 0);

      studentProfile = {
        fullName: student.fullName,
        universityId: student.universityId,
        department: student.department,
        gpa: student.gpa,
        level: getLevelForHours(student.department, completedHours),
      };
    }
  }

  return (
    <StickyHeader>
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-4 sm:flex sm:gap-6">
          {studentProfile && <ProfileMenu profile={studentProfile} />}
          <NavLinks role={role} className="flex items-center gap-4 sm:gap-6" />
        </div>
        <MobileMenu role={role} studentProfile={studentProfile} />
      </div>
    </StickyHeader>
  );
}
