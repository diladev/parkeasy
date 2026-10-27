/*
 * What a stay costs. Today: every started hour at the garage's hourly price,
 * at least one hour. The Lot Settings work adds a daily cap and date overrides
 * (Eid, Newroz, events) here, so every caller picks them up.
 */

const HOUR_MS = 3_600_000;

/** Every started hour, at least one: 10 min -> 1, 60 min -> 1, 61 min -> 2. */
export function chargedHours(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(ms / HOUR_MS));
}

/** A walk-in's fee for parking from `start` to `end`. Whole dinars. */
export function walkInCharge(
  pricePerHour: number,
  start: Date,
  end: Date,
): { hours: number; amount: number } {
  const hours = chargedHours(start, end);
  return { hours, amount: hours * pricePerHour };
}
