import { z } from "zod";
import { DEPARTMENTS } from "@/lib/curriculum";

const departmentValues = DEPARTMENTS.map((d) => d.value) as [string, ...string[]];

// Trimmed + lowercased everywhere an email is read or written, so
// "Foo@x.com" and "foo@x.com" are always treated as the same account.
const emailSchema = z.email("الإيميل غير صحيح").trim().toLowerCase();

export const studentRegisterSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم قصير جدًا"),
  email: emailSchema,
  universityId: z
    .string()
    .trim()
    .regex(/^\d{7}$/, "الرقم الجامعي لازم يكون 7 أرقام بالظبط"),
  password: z.string().min(6, "الباسورد لازم يكون 6 أحرف على الأقل"),
  department: z.enum(departmentValues, "اختار القسم"),
  gpa: z.coerce.number().min(0, "الـ GPA لازم يكون 0 أو أكتر").max(4, "الـ GPA من 4 بحد أقصى"),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "الباسورد مطلوب"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "لينك إعادة التعيين غير صحيح"),
  password: z.string().min(6, "الباسورد لازم يكون 6 أحرف على الأقل"),
});

export const completedCoursesSchema = z.object({
  courseCodes: z.array(z.string().min(1)),
});

export const createScheduleSchema = z.object({
  courseIds: z.array(z.string().min(1)).min(1, "لازم تختار مادة واحدة على الأقل"),
});
