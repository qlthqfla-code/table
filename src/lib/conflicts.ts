import { courseBlocks, type AlternativeSuggestion, type ConflictDetail, type CourseDTO } from "@/types/course";
import { timesOverlap } from "@/lib/time";

/**
 * ═══ شرح للمناقشة: مقارنة مادتين ═══
 * كل مادة عندها معادين في الأسبوع: محاضرة وتطبيق (courseBlocks بترجع الاتنين
 * كمصفوفة من "Blocks"، كل Block فيه يوم + وقت بداية + وقت نهاية).
 *
 * علشان أقارن مادتين (أ، ب) واعرف لو فيهم تعارض، لازم أقارن كل معاد من
 * مادة أ مع كل معاد من مادة ب — يعني 2×2 = 4 مقارنات ممكنة:
 *   محاضرة أ × محاضرة ب
 *   محاضرة أ × تطبيق ب
 *   تطبيق أ  × محاضرة ب
 *   تطبيق أ  × تطبيق ب
 * لو أي مقارنة من الأربعة دي في نفس اليوم ومتداخلة في الوقت (timesOverlap)،
 * يبقى المادتين متعارضتين، وبنرجع أول تعارض لقيناه عشان نعرضه للطالب.
 */
function findBlockConflict(courseA: CourseDTO, courseB: CourseDTO) {
  for (const blockA of courseBlocks(courseA)) {
    for (const blockB of courseBlocks(courseB)) {
      if (blockA.day !== blockB.day) continue;
      if (timesOverlap(blockA.startTime, blockA.endTime, blockB.startTime, blockB.endTime)) {
        return { blockA, blockB };
      }
    }
  }
  return null;
}

/**
 * ═══ شرح للمناقشة: فحص الجدول كله ═══
 * الطالب ممكن يختار أي عدد من المواد، فلازم أقارن "كل مادة مع كل مادة
 * تانية" مرة واحدة بس (مش هقارن أ مع ب وبعدين ب مع أ تاني، ده تكرار).
 * الحلقة الداخلية بتبدأ من j = i + 1 عشان كده بالظبط — علشان نغطي كل زوج
 * ممكن من غير ما نكرر أي مقارنة.
 *
 * لو عندي N مادة، عدد المقارنات = N×(N-1)/2 (تعقيد O(n²)) — مقبول جدًا
 * هنا لأن عدد المواد اللي الطالب بيسجلها في الترم الواحد صغير (بالكثير
 * 6-8 مواد)، فمفيش مشكلة أداء خالص.
 */
export function findConflicts(selected: CourseDTO[]): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const courseA = selected[i];
      const courseB = selected[j];
      const hit = findBlockConflict(courseA, courseB);
      if (hit) {
        conflicts.push({ courseA, courseB, blockA: hit.blockA, blockB: hit.blockB });
      }
    }
  }

  return conflicts;
}

/**
 * ═══ شرح للمناقشة: اقتراح البدائل ═══
 * لما يظهر تعارض، مش بس بنقول للطالب "فيه مشكلة" وخلاص — بندور له على حل.
 * الفكرة: كل مادة عندها أكتر من شعبة (Section) بمواعيد مختلفة. فبناخد كود
 * المادة (courseCode) للمادة اللي فيها مشكلة، ونجيب كل الشعب التانية بنفس
 * الكود، ونجرب كل شعبة منها: هل هتتعارض مع باقي المواد اللي الطالب مختارها
 * (غير المادة اللي بنستبدلها)؟ لو الإجابة "لأ"، يبقى دي بديل صالح ونقترحه.
 *
 * يعني: مادة فيها تعارض → دور على شعبة تانية لنفس المادة → جرب هل هتتصادم
 * مع الباقي ولا لأ → لو مفيش تصادم، اقترحها.
 */
export function findAlternatives(
  conflicts: ConflictDetail[],
  allCourses: CourseDTO[],
  selected: CourseDTO[]
): AlternativeSuggestion[] {
  const conflictingCourseIds = new Set<string>();
  for (const { courseA, courseB } of conflicts) {
    conflictingCourseIds.add(courseA.id);
    conflictingCourseIds.add(courseB.id);
  }

  const suggestions: AlternativeSuggestion[] = [];

  for (const conflictingId of conflictingCourseIds) {
    const replaces = selected.find((c) => c.id === conflictingId);
    if (!replaces) continue;

    const others = selected.filter((c) => c.id !== replaces.id);

    const candidates = allCourses.filter(
      (c) => c.courseCode === replaces.courseCode && c.id !== replaces.id
    );

    for (const candidate of candidates) {
      const wouldConflict = others.some((other) => findBlockConflict(other, candidate) !== null);
      if (!wouldConflict) {
        suggestions.push({ replaces, alternative: candidate });
      }
    }
  }

  return suggestions;
}
