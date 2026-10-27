/**
 * Every amount in ParkEasy is in Iraqi dinars, stored as a whole number.
 *
 * IQD has no coins in everyday use, so prices, balances and payments are
 * whole dinars: INTEGER columns and integer maths, with no 0.1 + 0.2 rounding
 * surprises. The few calculations that could produce a fraction (none today)
 * go through toDinars().
 */
export const CURRENCY = 'IQD';

/** Rounds to whole dinars. */
export function toDinars(amount: number): number {
  return Math.round(amount);
}

/** "12,500 IQD", for messages and notifications. */
export function formatDinars(amount: number): string {
  return `${toDinars(amount).toLocaleString('en-US')} ${CURRENCY}`;
}
