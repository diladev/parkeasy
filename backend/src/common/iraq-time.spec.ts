import {
  addDays,
  iraqDateKey,
  iraqDayStart,
  iraqMonthStart,
} from './iraq-time';

describe('Iraq time', () => {
  // 27 Oct 2026, 01:30 in Iraq = 26 Oct 22:30 UTC: already "tomorrow" in Iraq.
  const lateNightUtc = new Date('2026-10-26T22:30:00Z');

  it('starts the day at midnight Iraq time, not UTC', () => {
    expect(iraqDayStart(lateNightUtc).toISOString()).toBe(
      '2026-10-26T21:00:00.000Z',
    );
    expect(iraqDateKey(lateNightUtc)).toBe('2026-10-27');
  });

  it('finds the 1st of this month and earlier months, across years', () => {
    expect(iraqMonthStart(lateNightUtc).toISOString()).toBe(
      '2026-09-30T21:00:00.000Z',
    );
    expect(iraqMonthStart(lateNightUtc, 1).toISOString()).toBe(
      '2026-08-31T21:00:00.000Z',
    );
    expect(
      iraqMonthStart(new Date('2026-01-15T12:00:00Z'), 1).toISOString(),
    ).toBe('2025-11-30T21:00:00.000Z');
  });

  it('counts whole days', () => {
    expect(iraqDateKey(addDays(lateNightUtc, -6))).toBe('2026-10-21');
  });
});
