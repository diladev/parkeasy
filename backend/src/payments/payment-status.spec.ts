import { canMoveTo, isFinal, PAYMENT_STATUSES } from './payment-status';

describe('payment status', () => {
  it('lets a pending payment finish in any way', () => {
    for (const to of ['paid', 'declined', 'expired', 'cancelled'] as const) {
      expect(canMoveTo('pending', to)).toBe(true);
    }
  });

  it('never changes a finished payment', () => {
    for (const from of PAYMENT_STATUSES.filter(
      (status) => status !== 'pending',
    )) {
      expect(isFinal(from)).toBe(true);
      for (const to of PAYMENT_STATUSES) {
        expect(canMoveTo(from, to)).toBe(false);
      }
    }
  });

  it('does not count pending -> pending as a change', () => {
    expect(canMoveTo('pending', 'pending')).toBe(false);
    expect(isFinal('pending')).toBe(false);
  });
});
