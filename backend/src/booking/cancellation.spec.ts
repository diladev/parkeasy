import {
  canCancel,
  cancellableUntil,
  DEFAULT_FREE_CANCELLATION_MINUTES,
} from './cancellation';

describe('cancellation window', () => {
  const start = new Date('2026-10-24T06:15:00Z');
  const minutes = (n: number) => new Date(start.getTime() + n * 60_000);

  it("ends the lot's number of minutes after the start", () => {
    expect(cancellableUntil(start, 10)).toEqual(minutes(10));
    expect(cancellableUntil(start, 25)).toEqual(minutes(25));
  });

  it('is 10 minutes unless the lot says otherwise', () => {
    expect(DEFAULT_FREE_CANCELLATION_MINUTES).toBe(10);
  });

  it('allows cancelling up to and including the last moment', () => {
    const booking = { cancellable_until: cancellableUntil(start, 10) };

    expect(canCancel(booking, start)).toBe(true);
    expect(canCancel(booking, minutes(9.99))).toBe(true);
    expect(canCancel(booking, minutes(10))).toBe(true);
  });

  it('refuses cancelling once the window is over', () => {
    const booking = { cancellable_until: cancellableUntil(start, 10) };

    expect(canCancel(booking, new Date(minutes(10).getTime() + 1))).toBe(false);
    expect(canCancel(booking, minutes(82))).toBe(false);
  });

  it('a lot without a window can never be cancelled once started', () => {
    const booking = { cancellable_until: cancellableUntil(start, 0) };

    expect(canCancel(booking, start)).toBe(true);
    expect(canCancel(booking, minutes(1))).toBe(false);
  });
});
