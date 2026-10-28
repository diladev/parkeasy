import { DAY_MS } from 'src/common/iraq-time';
import type { PriceOverrideRule } from './pricing';

/*
 * The rules an owner's prices must follow, beyond the shape of each field
 * (that's the DTOs' job). Checked before anything is saved; the Garage
 * Portal checks the same in the browser so most mistakes never reach here.
 */

/** Longest special price, in days: a holiday or an event, not a new normal price. */
export const MAX_OVERRIDE_DAYS = 31;

/** A message key (message.json) and its arguments. */
export interface PriceProblem {
  key:
    | 'DAILY_CAP_BELOW_PRICE'
    | 'PRICE_OVERRIDE_DATES'
    | 'PRICE_OVERRIDE_ENDED'
    | 'PRICE_OVERRIDE_TOO_LONG'
    | 'PRICE_OVERRIDE_CAP_BELOW_PRICE'
    | 'PRICE_OVERRIDE_OVERLAP';
  args?: Record<string, string | number>;
}

/** A cap below one hour's price would make a short stay cost less than its hours. */
export const capBelowPrice = (price: number, cap: number | null | undefined) =>
  cap !== null && cap !== undefined && cap < price;

/** Days from `start` to `end`, both included: "2027-03-20" to "2027-03-22" is 3. */
export function daysInRange(start: string, end: string): number {
  return Math.round((Date.parse(end) - Date.parse(start)) / DAY_MS) + 1;
}

/** The first problem with these prices, or null. `today` is the Iraq calendar day. */
export function checkPrices(
  prices: {
    price_per_hour: number;
    daily_cap?: number | null;
    price_overrides: (Omit<PriceOverrideRule, 'daily_cap'> & {
      daily_cap?: number | null;
    })[];
  },
  today: string,
): PriceProblem | null {
  if (capBelowPrice(prices.price_per_hour, prices.daily_cap)) {
    return { key: 'DAILY_CAP_BELOW_PRICE' };
  }

  for (const rule of prices.price_overrides) {
    const label = rule.label;
    if (rule.start_date > rule.end_date) {
      return { key: 'PRICE_OVERRIDE_DATES', args: { label } };
    }
    if (rule.end_date < today) {
      return { key: 'PRICE_OVERRIDE_ENDED', args: { label } };
    }
    if (daysInRange(rule.start_date, rule.end_date) > MAX_OVERRIDE_DAYS) {
      return {
        key: 'PRICE_OVERRIDE_TOO_LONG',
        args: { label, max: MAX_OVERRIDE_DAYS },
      };
    }
    if (capBelowPrice(rule.price_per_hour, rule.daily_cap)) {
      return { key: 'PRICE_OVERRIDE_CAP_BELOW_PRICE', args: { label } };
    }
  }

  // One price per day: no two special prices may share a day.
  const sorted = [...prices.price_overrides].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start_date <= sorted[i - 1].end_date) {
      return {
        key: 'PRICE_OVERRIDE_OVERLAP',
        args: { first: sorted[i - 1].label, second: sorted[i].label },
      };
    }
  }
  return null;
}
