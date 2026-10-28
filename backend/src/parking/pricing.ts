import { iraqDateKey } from 'src/common/iraq-time';

/*
 * What a stay costs. One set of rules for app bookings, extensions and
 * walk-ins, so the price an owner sets is the price every driver pays:
 *
 * - every started hour is charged, at least one;
 * - each hour costs the hourly price of the Iraq calendar day it starts on:
 *   a date override (Eid, Newroz, a match day) if one covers that day,
 *   otherwise the lot's normal price;
 * - a day's hours never cost more than that day's cap, if it has one.
 *
 * All amounts are whole Iraqi dinars (see common/money.ts).
 */

const HOUR_MS = 3_600_000;

/** A different price for a range of days, both ends included ("2026-03-20" to "2026-03-22"). */
export interface PriceOverrideRule {
  label: string;
  start_date: string;
  end_date: string;
  price_per_hour: number;
  /** null: no cap on these days. */
  daily_cap: number | null;
}

export interface PriceRules {
  price_per_hour: number;
  /** The most one calendar day costs; null for no cap. */
  daily_cap: number | null;
  overrides: PriceOverrideRule[];
}

/** The price that applies on one day, and the override it comes from (null: the normal price). */
export interface DayPrice {
  price_per_hour: number;
  daily_cap: number | null;
  label: string | null;
}

/** One Iraq calendar day of a stay. */
export interface PriceDay extends DayPrice {
  /** "2026-10-28" */
  date: string;
  /** Hours that start on this day. */
  hours: number;
  amount: number;
  /** The cap brought this day's amount down. */
  capped: boolean;
}

export interface PriceQuote {
  hours: number;
  amount: number;
  days: PriceDay[];
}

/** Every started hour, at least one: 10 min -> 1, 60 min -> 1, 61 min -> 2. */
export function chargedHours(start: Date, end: Date): number {
  const ms = Math.max(0, end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(ms / HOUR_MS));
}

/** The price on `date` ("2026-10-28"). */
export function priceOn(rules: PriceRules, date: string): DayPrice {
  const override = rules.overrides.find(
    (rule) => rule.start_date <= date && date <= rule.end_date,
  );
  return override
    ? {
        price_per_hour: override.price_per_hour,
        daily_cap: override.daily_cap,
        label: override.label,
      }
    : {
        price_per_hour: rules.price_per_hour,
        daily_cap: rules.daily_cap,
        label: null,
      };
}

/** What parking from `start` to `end` costs, day by day. */
export function priceStay(
  rules: PriceRules,
  start: Date,
  end: Date,
): PriceQuote {
  const hours = chargedHours(start, end);
  const days: PriceDay[] = [];

  for (let hour = 0; hour < hours; hour++) {
    const date = iraqDateKey(new Date(start.getTime() + hour * HOUR_MS));
    const last = days.at(-1);
    if (last?.date === date) last.hours++;
    else
      days.push({
        date,
        hours: 1,
        amount: 0,
        capped: false,
        ...priceOn(rules, date),
      });
  }

  for (const day of days) {
    const full = day.hours * day.price_per_hour;
    day.capped = day.daily_cap !== null && full > day.daily_cap;
    day.amount = day.capped ? (day.daily_cap as number) : full;
  }

  return {
    hours,
    amount: days.reduce((sum, day) => sum + day.amount, 0),
    days,
  };
}

/**
 * What adding time costs: the stay's new price minus its price so far, so a
 * day already at its cap adds nothing. Never negative.
 */
export function extensionCost(
  rules: PriceRules,
  start: Date,
  oldEnd: Date,
  newEnd: Date,
): number {
  const before = priceStay(rules, start, oldEnd).amount;
  const after = priceStay(rules, start, newEnd).amount;
  return Math.max(0, after - before);
}

/**
 * The rules a stay starting at `from` keeps: the lot's prices now, and the
 * overrides that haven't ended yet. Bookings save these, so a price change
 * later doesn't change what an existing booking or a parked car pays.
 */
export function rulesFrom(
  lot: { price_per_hour: number; daily_cap: number | null },
  overrides: PriceOverrideRule[],
  from: Date,
): PriceRules {
  const today = iraqDateKey(from);
  return {
    price_per_hour: lot.price_per_hour,
    daily_cap: lot.daily_cap,
    overrides: overrides
      .filter((rule) => rule.end_date >= today)
      .map(({ label, start_date, end_date, price_per_hour, daily_cap }) => ({
        label,
        start_date,
        end_date,
        price_per_hour,
        daily_cap,
      })),
  };
}

/** A booking's saved rules; bookings made before rules were saved paid the plain hourly price. */
export function bookingRules(booking: {
  price_rules: PriceRules | null;
  price_per_hour: number;
}): PriceRules {
  return (
    booking.price_rules ?? {
      price_per_hour: booking.price_per_hour,
      daily_cap: null,
      overrides: [],
    }
  );
}
