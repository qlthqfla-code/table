import { Fragment } from "react";
import { courseBlocks, type CourseBlock, type CourseDTO } from "@/types/course";
import { DAY_LABELS_AR, DAY_ORDER } from "@/lib/time";
import { BREAK, PERIODS, periodsForBlock } from "@/lib/periods";

interface PlacedBlock {
  course: CourseDTO;
  block: CourseBlock;
}

/** For a given day + period, every course block that overlaps that period. */
function blocksInCell(
  placed: PlacedBlock[],
  day: (typeof DAY_ORDER)[number],
  periodNumber: number
): PlacedBlock[] {
  return placed.filter(
    ({ block }) =>
      block.day === day && periodsForBlock(block.startTime, block.endTime).some((p) => p.number === periodNumber)
  );
}

export function WeeklyCalendar({ courses }: { courses: CourseDTO[] }) {
  const placed: PlacedBlock[] = courses.flatMap((course) =>
    courseBlocks(course).map((block) => ({ course, block }))
  );

  const hasAnyBlocks = placed.length > 0;

  return (
    <div className="overflow-x-auto rounded-lg border border-primary-100">
      <table className="w-full min-w-[820px] table-fixed border-collapse text-xs">
        <thead>
          <tr className="bg-primary-800 text-white">
            <th className="w-20 border border-primary-700 px-2 py-2 font-semibold">الفترة</th>
            {DAY_ORDER.map((day) => (
              <th key={day} className="border border-primary-700 px-2 py-2 font-semibold">
                {DAY_LABELS_AR[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!hasAnyBlocks && (
            <tr>
              <td
                colSpan={DAY_ORDER.length + 1}
                className="border border-primary-100 px-3 py-6 text-center text-primary-400"
              >
                مفيش مواد
              </td>
            </tr>
          )}

          {hasAnyBlocks &&
            PERIODS.map((period) => (
              <Fragment key={period.number}>
                <tr>
                  <td className="border border-primary-100 bg-primary-50 px-2 py-2 text-center font-semibold text-primary-700">
                    {period.number}
                    <div className="text-[10px] font-normal text-primary-400">
                      {period.startTime}-{period.endTime}
                    </div>
                  </td>
                  {DAY_ORDER.map((day) => {
                    const cellBlocks = blocksInCell(placed, day, period.number);
                    return (
                      <td key={day} className="border border-primary-100 px-1.5 py-1.5 align-top">
                        <div className="flex flex-col gap-1">
                          {cellBlocks.map(({ course, block }) => (
                            <div
                              key={`${course.id}-${block.kind}`}
                              className={`rounded-md p-1.5 ${
                                block.kind === "lecture"
                                  ? "bg-primary-100 text-primary-900"
                                  : "bg-accent-500/15 text-accent-600"
                              }`}
                            >
                              <p className="truncate font-semibold">{course.courseCode}</p>
                              <p className="truncate">{course.courseName}</p>
                              <p className="text-[10px]">
                                {block.kind === "lecture" ? "محاضرة" : "تطبيق"}
                                {block.kind === "lecture"
                                  ? course.lectureRoom && ` · ${course.lectureRoom}`
                                  : course.sectionRoom && ` · ${course.sectionRoom}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                {period.number === BREAK.afterPeriod && (
                  <tr>
                    <td
                      colSpan={DAY_ORDER.length + 1}
                      className="border border-primary-100 bg-warning-50 px-2 py-1 text-center text-[11px] font-medium text-warning-500"
                    >
                      بريك ({BREAK.startTime}-{BREAK.endTime})
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
}
