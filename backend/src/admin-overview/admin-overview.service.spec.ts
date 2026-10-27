import { dailyRevenue } from './admin-overview.service';

describe('dailyRevenue', () => {
  // 21 Oct 2026, midnight in Iraq.
  const firstDay = new Date('2026-10-20T21:00:00Z');

  it('adds up each Iraq day and fills empty days with 0', () => {
    const days = dailyRevenue(
      [
        { start_time: new Date('2026-10-21T09:00:00Z'), total_cost: 3000 },
        { start_time: new Date('2026-10-21T15:00:00Z'), total_cost: 1500 },
        // 23:30 UTC on the 23rd is already the 24th in Iraq.
        { start_time: new Date('2026-10-23T23:30:00Z'), total_cost: 2000 },
      ],
      firstDay,
      7,
    );
    expect(days).toEqual([
      { date: '2026-10-21', amount: 4500 },
      { date: '2026-10-22', amount: 0 },
      { date: '2026-10-23', amount: 0 },
      { date: '2026-10-24', amount: 2000 },
      { date: '2026-10-25', amount: 0 },
      { date: '2026-10-26', amount: 0 },
      { date: '2026-10-27', amount: 0 },
    ]);
  });

  it('ignores bookings outside the chart', () => {
    const days = dailyRevenue(
      [{ start_time: new Date('2026-10-30T09:00:00Z'), total_cost: 9000 }],
      firstDay,
      7,
    );
    expect(days.every((day) => day.amount === 0)).toBe(true);
  });
});
