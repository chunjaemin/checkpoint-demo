import { format, parseISO } from 'date-fns';

export type DateKey = string; // yyyy-MM-dd
export type MonthKey = string; // yyyy-MM

export type HasStartTimeAndName = {
  startTime: string;
  name: string;
};

export type ByDate<T> = Record<DateKey, T[]>;
export type ByMonth<T> = Record<MonthKey, ByDate<T>>;

export type IndexOptions<T extends HasStartTimeAndName> = {
  /** true면 dateKey별로 startTime->name 순으로 정렬 */
  sortWithinDate?: boolean;
  /** startTime 파싱 함수(기본: date-fns parseISO) */
  parseStartTime?: (iso: string) => Date;
  /** dateKey 포맷(기본: yyyy-MM-dd) */
  dateKeyFormat?: string;
  /** monthKey 포맷(기본: yyyy-MM) */
  monthKeyFormat?: string;
};

export function indexSchedulesByDate<T extends HasStartTimeAndName>(
  schedules: T[],
  options: IndexOptions<T> = {}
): ByDate<T> {
  const {
    sortWithinDate = true,
    parseStartTime = parseISO,
    dateKeyFormat = 'yyyy-MM-dd',
  } = options;

  const byDate: ByDate<T> = {};

  for (const s of schedules) {
    const d = parseStartTime(s.startTime);
    const dateKey = format(d, dateKeyFormat);
    (byDate[dateKey] ||= []).push(s);
  }

  if (sortWithinDate) {
    for (const dateKey of Object.keys(byDate)) {
      byDate[dateKey].sort((a, b) => {
        const ta = parseStartTime(a.startTime).getTime();
        const tb = parseStartTime(b.startTime).getTime();
        if (ta !== tb) return ta - tb;
        return a.name.localeCompare(b.name);
      });
    }
  }

  return byDate;
}

export function indexSchedulesByMonth<T extends HasStartTimeAndName>(
  schedules: T[],
  options: IndexOptions<T> = {}
): ByMonth<T> {
  const {
    sortWithinDate = true,
    parseStartTime = parseISO,
    dateKeyFormat = 'yyyy-MM-dd',
    monthKeyFormat = 'yyyy-MM',
  } = options;

  const byMonth: ByMonth<T> = {};

  for (const s of schedules) {
    const d = parseStartTime(s.startTime);
    const monthKey = format(d, monthKeyFormat);
    const dateKey = format(d, dateKeyFormat);
    (byMonth[monthKey] ||= {});
    (byMonth[monthKey][dateKey] ||= []).push(s);
  }

  if (sortWithinDate) {
    for (const monthKey of Object.keys(byMonth)) {
      const byDate = byMonth[monthKey];
      for (const dateKey of Object.keys(byDate)) {
        byDate[dateKey].sort((a, b) => {
          const ta = parseStartTime(a.startTime).getTime();
          const tb = parseStartTime(b.startTime).getTime();
          if (ta !== tb) return ta - tb;
          return a.name.localeCompare(b.name);
        });
      }
    }
  }

  return byMonth;
}

