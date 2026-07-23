import type { CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, DAY_ORDER, formatTime } from "@/lib/time";

export function WeeklyCalendar({ courses }: { courses: CourseDTO[] }) {
  const byDay = DAY_ORDER.map((day) => ({
    day,
    courses: courses
      .filter((c) => c.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {byDay.map(({ day, courses: dayCourses }) => (
        <div key={day} className="flex flex-col gap-2">
          <div className="rounded-lg bg-primary-800 px-3 py-2 text-center text-sm font-semibold text-white">
            {DAY_LABELS_AR[day]}
          </div>

          {dayCourses.length === 0 && (
            <div className="rounded-lg border border-dashed border-primary-100 px-3 py-4 text-center text-xs text-primary-300">
              مفيش مواد
            </div>
          )}

          {dayCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-lg border border-primary-100 bg-white p-3 shadow-sm"
            >
              <p className="text-sm font-semibold text-primary-950">
                {course.courseName}
              </p>
              <p className="text-xs text-primary-400">{course.courseCode}</p>
              <p className="mt-1.5 text-xs font-medium text-primary-700">
                {formatTime(course.startTime)} – {formatTime(course.endTime)}
              </p>
              {course.room && (
                <p className="text-xs text-primary-500">قاعة {course.room}</p>
              )}
              {course.instructor && (
                <p className="text-xs text-primary-500">{course.instructor}</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
