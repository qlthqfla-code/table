import { readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { DEPARTMENTS, flattenCurriculum, type RawCurriculum } from "../src/lib/curriculum";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? "admin@modern-academy.local";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin ready: ${admin.email}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`(using default dev password "${password}" — set ADMIN_PASSWORD in .env to change it)`);
  }
}

async function seedCurriculum() {
  for (const department of DEPARTMENTS) {
    const filePath = join(__dirname, "curriculum", `${department.curriculumFile}.json`);
    const raw = JSON.parse(readFileSync(filePath, "utf-8")) as RawCurriculum;
    const subjects = flattenCurriculum(raw);

    for (const subject of subjects) {
      await prisma.subject.upsert({
        where: { department_courseCode: { department: department.value, courseCode: subject.courseCode } },
        update: subject,
        create: { ...subject, department: department.value },
      });
    }

    console.log(`Curriculum ready: ${subjects.length} subjects (${department.label}).`);
  }
}

async function main() {
  await seedAdmin();
  await seedCurriculum();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
