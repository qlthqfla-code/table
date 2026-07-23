import { z } from "zod";
import { DEPARTMENTS } from "@/lib/curriculum";

const departmentValues = DEPARTMENTS.map((d) => d.value) as [string, ...string[]];

export const studentRegisterSchema = z.object({
  fullName: z.string().trim().min(2, "الاسم قصير جدًا"),
  email: z.email("الإيميل غير صحيح"),
  universityId: z
    .string()
    .trim()
    .regex(/^\d{7}$/, "الرقم الجامعي لازم يكون 7 أرقام بالظبط"),
  password: z.string().min(6, "الباسورد لازم يكون 6 أحرف على الأقل"),
  department: z.enum(departmentValues, "اختار القسم"),
  gpa: z.coerce.number().min(0, "الـ GPA لازم يكون 0 أو أكتر").max(4, "الـ GPA من 4 بحد أقصى"),
});

export const studentLoginSchema = z.object({
  email: z.email("الإيميل غير صحيح"),
  password: z.string().min(1, "الباسورد مطلوب"),
});

export const adminLoginSchema = z.object({
  email: z.email("الإيميل غير صحيح"),
  password: z.string().min(1, "الباسورد مطلوب"),
});

export const completedCoursesSchema = z.object({
  courseCodes: z.array(z.string().min(1)),
});

export const createScheduleSchema = z.object({
  courseIds: z.array(z.string().min(1)).min(1, "لازم تختار مادة واحدة على الأقل"),
});
