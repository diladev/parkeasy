import { periodStart } from './garage-bookings.service';

describe('periodStart', () => {
  // 01:30 on 28 Oct in Iraq (UTC+3) is still 27 Oct in UTC.
  const now = new Date('2026-10-27T22:30:00Z');

  it('counts days in Iraq time, today included', () => {
    expect(periodStart('today', now)).toEqual(new Date('2026-10-27T21:00:00Z'));
    expect(periodStart('7d', now)).toEqual(new Date('2026-10-21T21:00:00Z'));
    expect(periodStart('30d', now)).toEqual(new Date('2026-09-28T21:00:00Z'));
  });

  it('has no start for all bookings', () => {
    expect(periodStart('all', now)).toBeNull();
  });
});
