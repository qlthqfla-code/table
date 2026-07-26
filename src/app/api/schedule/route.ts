import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { destroySessionCookie, getSession } from "@/lib/auth";
import { createScheduleSchema } from "@/lib/validators";
import { findAlternatives, findConflicts } from "@/lib/conflicts";
import {
  buildCourseNameMap,
  missingPrerequisites,
  withCurriculumPrerequisites,
} from "@/lib/prerequisites";
import { maxCreditHoursForGpa } from "@/lib/creditLimit";
import { SECTION_CAPACITY } from "@/lib/capacity";
import type { CourseDTO } from "@/types/course";

class CapacityError extends Error {}

/** Which of `newCourseIds` are already at SECTION_CAPACITY, counting every
 * other student's active schedule (never the requesting student's own). */
async function findFullCourses(
  client: Prisma.TransactionClient | typeof prisma,
  newCourseIds: string[],
  selectedCourses: { id: string; courseName: string; section: string | null }[],
  studentId: string
) {
  if (newCourseIds.length === 0) return [];
  const counts = await client.studentScheduleItem.groupBy({
    by: ["courseId"],
    where: { courseId: { in: newCourseIds }, schedule: { studentId: { not: studentId } } },
    _count: { _all: true },
  });
  const countByCourseId = new Map(counts.map((row) => [row.courseId, row._count._all]));
  return selectedCourses.filter(
    (c) => newCourseIds.includes(c.id) && (countByCourseId.get(c.id) ?? 0) >= SECTION_CAPACITY
  );
}

function fullCoursesMessage(fullCourses: { courseName: string; section: string | null }[]) {
  const names = fullCourses
    .map((c) => `${c.courseName}${c.section ? ` - شعبة ${c.section}` : ""}`)
    .join("، ");
  return `الشعب دي وصلت للحد الأقصى (${SECTION_CAPACITY} طالب) ومقفولة دلوقتي: ${names}`;
}

function toDTO(course: {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  prerequisites: string[];
  section: string | null;
  instructor: string | null;
  lectureDay: string;
  lectureStartTime: string;
  lectureEndTime: string;
  lectureRoom: string | null;
  sectionDay: string;
  sectionStartTime: string;
  sectionEndTime: string;
  sectionRoom: string | null;
}): CourseDTO {
  return course;
}

export async function GET() {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const schedule = await prisma.studentSchedule.findFirst({
    where: { studentId: session.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { course: true } } },
  });

  if (!schedule) {
    return NextResponse.json({ courses: [] });
  }

  return NextResponse.json({
    courses: schedule.items.map((item) => toDTO(item.course)),
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (session?.role !== "student") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" },
      { status: 400 }
    );
  }

  const student = await prisma.student.findUnique({
    where: { id: session.id },
    select: { department: true, completedCourseCodes: true, gpa: true },
  });
  if (!student) {
    await destroySessionCookie();
    return NextResponse.json({ error: "الجلسة انتهت، سجل دخول تاني" }, { status: 401 });
  }

  // Scoped to the student's own department — also stops a tampered request
  // from pulling in another department's course by id.
  const selectedCourses = await prisma.course.findMany({
    where: { id: { in: parsed.data.courseIds }, department: student.department },
  });

  if (selectedCourses.length !== parsed.data.courseIds.length) {
    return NextResponse.json(
      { error: "في مادة من اللي اخترتها مبقاش موجود، حدّث الصفحة وحاول تاني" },
      { status: 409 }
    );
  }

  const seenCourseCodes = new Set<string>();
  const duplicateNames = new Set<string>();
  for (const course of selectedCourses) {
    if (seenCourseCodes.has(course.courseCode)) duplicateNames.add(course.courseName);
    seenCourseCodes.add(course.courseCode);
  }
  if (duplicateNames.size > 0) {
    return NextResponse.json(
      { error: `مينفعش تسجل نفس المادة أكتر من مرة: ${[...duplicateNames].join("، ")}` },
      { status: 400 }
    );
  }

  // Sections the student already held before this submission never count
  // against them — otherwise re-saving an unchanged schedule could fail
  // once other students fill the section past capacity in the meantime.
  const previouslyHeldItems = await prisma.studentScheduleItem.findMany({
    where: { schedule: { studentId: session.id } },
    select: { courseId: true },
  });
  const previouslyHeldCourseIds = new Set(previouslyHeldItems.map((i) => i.courseId));
  const newCourseIds = selectedCourses
    .map((c) => c.id)
    .filter((id) => !previouslyHeldCourseIds.has(id));

  // Fast-path rejection so an obviously-full section doesn't make the
  // student wait through the rest of the validation pipeline below. This
  // read is outside any transaction, so it's still just an optimistic
  // check — the authoritative one runs inside the write transaction.
  const earlyFullCourses = await findFullCourses(prisma, newCourseIds, selectedCourses, session.id);
  if (earlyFullCourses.length > 0) {
    return NextResponse.json({ error: fullCoursesMessage(earlyFullCourses) }, { status: 422 });
  }

  const totalCreditHours = selectedCourses.reduce((sum, c) => sum + c.creditHours, 0);
  const maxCreditHours = maxCreditHoursForGpa(student.gpa);
  if (totalCreditHours > maxCreditHours) {
    return NextResponse.json(
      {
        error: `مجموع الساعات اللي اخترتها (${totalCreditHours}) أكتر من الحد المسموح بمعدلك (${maxCreditHours} ساعة)`,
      },
      { status: 422 }
    );
  }

  const subjects = await prisma.subject.findMany({
    where: { department: student.department },
    select: { courseCode: true, courseName: true, prerequisites: true },
  });
  const curriculumPrereqs = new Map(subjects.map((s) => [s.courseCode, s.prerequisites]));
  const selectedDTOs = withCurriculumPrerequisites(selectedCourses.map(toDTO), curriculumPrereqs);

  const completedSet = new Set(student.completedCourseCodes);
  const nameMap = buildCourseNameMap(selectedDTOs, subjects);
  const prerequisiteIssues = selectedDTOs
    .map((course) => ({ course, missing: missingPrerequisites(course, completedSet) }))
    .filter((issue) => issue.missing.length > 0);

  if (prerequisiteIssues.length > 0) {
    const details = prerequisiteIssues
      .map(
        (issue) =>
          `${issue.course.courseName} (يحتاج: ${issue.missing
            .map((code) => nameMap.get(code) ?? code)
            .join("، ")})`
      )
      .join(" — ");
    return NextResponse.json(
      { error: `في مواد لسه ماستوفتش المتطلبات السابقة: ${details}` },
      { status: 422 }
    );
  }

  const conflicts = findConflicts(selectedDTOs);

  if (conflicts.length > 0) {
    const relevantCodes = new Set(
      conflicts.flatMap((c) => [c.courseA.courseCode, c.courseB.courseCode])
    );
    const allCoursesForCodes = await prisma.course.findMany({
      where: { courseCode: { in: [...relevantCodes] }, department: student.department },
    });
    const alternatives = findAlternatives(
      conflicts,
      allCoursesForCodes.map(toDTO),
      selectedDTOs
    );

    return NextResponse.json({ conflicts, alternatives }, { status: 409 });
  }

  try {
    const schedule = await prisma.$transaction(
      async (tx) => {
        // Re-check capacity inside the transaction, right before writing —
        // this is what actually closes the race window between two
        // students grabbing the last seat at the same time. Combined with
        // Serializable isolation, Postgres itself will abort one of two
        // concurrent transactions that both try to claim the last seat.
        const fullCourses = await findFullCourses(tx, newCourseIds, selectedCourses, session.id);
        if (fullCourses.length > 0) {
          throw new CapacityError(fullCoursesMessage(fullCourses));
        }

        await tx.studentSchedule.deleteMany({ where: { studentId: session.id } });
        return tx.studentSchedule.create({
          data: {
            studentId: session.id,
            items: {
              create: selectedCourses.map((course) => ({ courseId: course.id })),
            },
          },
          include: { items: { include: { course: true } } },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json({
      courses: schedule.items.map((item) => toDTO(item.course)),
    });
  } catch (err) {
    if (err instanceof CapacityError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    // Postgres aborts one side of a genuine write conflict under
    // Serializable isolation — safe to ask the student to just resubmit.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034") {
      return NextResponse.json(
        { error: "حصل تعارض وقتي وانت بتسجل، حاول تاني" },
        { status: 409 }
      );
    }
    throw err;
  }
}
