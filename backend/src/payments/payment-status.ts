/**
 * The life of a payment:
 *
 *   pending ──> paid        the customer approved it; the wallet was credited
 *          ├──> declined    the customer or the provider refused it
 *          ├──> expired     nobody approved it in time
 *          └──> cancelled   the customer gave up in the app
 *
 * Only `pending` can change, and only once. Every other status is final, which
 * is what makes a repeated provider callback harmless.
 */
export const PAYMENT_STATUSES = [
  'pending',
  'paid',
  'declined',
  'expired',
  'cancelled',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const NEXT: Record<PaymentStatus, readonly PaymentStatus[]> = {
  pending: ['paid', 'declined', 'expired', 'cancelled'],
  paid: [],
  declined: [],
  expired: [],
  cancelled: [],
};

export function canMoveTo(from: PaymentStatus, to: PaymentStatus): boolean {
  return NEXT[from].includes(to);
}

export function isFinal(status: PaymentStatus): boolean {
  return NEXT[status].length === 0;
}
