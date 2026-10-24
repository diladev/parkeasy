/**
 * The cancellation rule.
 *
 * A booking can be cancelled, with everything paid back, only during its lot's
 * free cancellation window: the first few minutes after it starts (10 unless
 * the lot sets another number). After that it can't be cancelled; the driver
 * can end the parking early instead, which frees the slot but refunds nothing.
 */

/** Used when a lot doesn't set its own window. */
export const DEFAULT_FREE_CANCELLATION_MINUTES = 10;

/** The longest window a lot can offer. */
export const MAX_FREE_CANCELLATION_MINUTES = 60;

/** The last moment a booking that starts at [start] can be cancelled. */
export function cancellableUntil(
  start: Date,
  freeCancellationMinutes: number,
): Date {
  return new Date(start.getTime() + freeCancellationMinutes * 60_000);
}

/** Whether a booking can still be cancelled at [now]. The last moment itself counts. */
export function canCancel(
  booking: { cancellable_until: Date },
  now: Date,
): boolean {
  return now.getTime() <= booking.cancellable_until.getTime();
}
