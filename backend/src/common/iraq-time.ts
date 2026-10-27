/**
 * Day and month boundaries in Iraq time, for "today", "this month" and daily
 * figures. Iraq is UTC+3 all year (no daylight saving since 2008), so a fixed
 * offset is exact and keeps the maths simple and fast.
 */
const IRAQ_OFFSET_MS = 3 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;

/** The same instant, shifted so its UTC fields read as Iraq wall-clock time. */
const toIraqClock = (date: Date) => new Date(date.getTime() + IRAQ_OFFSET_MS);
const fromIraqClock = (wallClockUtc: number) =>
  new Date(wallClockUtc - IRAQ_OFFSET_MS);

/** Midnight in Iraq at the start of the day `date` falls on. */
export function iraqDayStart(date: Date): Date {
  const clock = toIraqClock(date);
  return fromIraqClock(
    Date.UTC(clock.getUTCFullYear(), clock.getUTCMonth(), clock.getUTCDate()),
  );
}

/** Midnight in Iraq on the 1st of the month `date` falls in (`monthsBack` earlier). */
export function iraqMonthStart(date: Date, monthsBack = 0): Date {
  const clock = toIraqClock(date);
  return fromIraqClock(
    Date.UTC(clock.getUTCFullYear(), clock.getUTCMonth() - monthsBack, 1),
  );
}

/** "2026-10-27": the Iraq calendar day of `date`. */
export function iraqDateKey(date: Date): string {
  return toIraqClock(date).toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}
