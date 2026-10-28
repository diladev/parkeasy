import {
  bookingRules,
  chargedHours,
  extensionCost,
  priceOn,
  priceStay,
  rulesFrom,
  type PriceRules,
} from './pricing';

/** Minutes after 12:00 on 27 Oct 2026, Iraq time (09:00 UTC). */
const at = (minutes: number) =>
  new Date(Date.UTC(2026, 9, 27, 9, 0) + minutes * 60_000);
const HOUR = 60;

const plain: PriceRules = {
  price_per_hour: 1500,
  daily_cap: null,
  overrides: [],
};
const capped: PriceRules = { ...plain, daily_cap: 9000 };
const eid = {
  label: 'Eid',
  start_date: '2026-10-28',
  end_date: '2026-10-29',
  price_per_hour: 2500,
  daily_cap: 15000,
};

describe('chargedHours', () => {
  it('charges every started hour, and at least one', () => {
    expect(chargedHours(at(0), at(0))).toBe(1);
    expect(chargedHours(at(0), at(10))).toBe(1);
    expect(chargedHours(at(0), at(60))).toBe(1);
    expect(chargedHours(at(0), at(61))).toBe(2);
    expect(chargedHours(at(0), at(180))).toBe(3);
  });

  it('never goes below one hour, even with a clock that went backwards', () => {
    expect(chargedHours(at(30), at(0))).toBe(1);
  });
});

describe('priceStay', () => {
  it('multiplies the hours by the hourly price', () => {
    expect(priceStay(plain, at(0), at(95))).toEqual({
      hours: 2,
      amount: 3000,
      days: [
        {
          date: '2026-10-27',
          hours: 2,
          price_per_hour: 1500,
          daily_cap: null,
          label: null,
          amount: 3000,
          capped: false,
        },
      ],
    });
  });

  it('stops at the daily cap', () => {
    // 12:00 to 23:00: 11 hours would be 16,500.
    const quote = priceStay(capped, at(0), at(11 * HOUR));
    expect(quote).toMatchObject({ hours: 11, amount: 9000 });
    expect(quote.days[0]).toMatchObject({ hours: 11, capped: true });
    // Exactly at the cap is not "capped".
    expect(priceStay(capped, at(0), at(6 * HOUR)).days[0]).toMatchObject({
      amount: 9000,
      capped: false,
    });
  });

  it('starts a new day (and a new cap) at midnight in Iraq', () => {
    // 12:00 on the 27th to 14:00 on the 28th: 12 hours, then 14.
    const quote = priceStay(capped, at(0), at(26 * HOUR));
    expect(
      quote.days.map(({ date, hours, amount }) => [date, hours, amount]),
    ).toEqual([
      ['2026-10-27', 12, 9000],
      ['2026-10-28', 14, 9000],
    ]);
    expect(quote.amount).toBe(18000);
  });

  it('charges the override on the days it covers, with its own cap', () => {
    const rules = { ...capped, overrides: [eid] };
    // 22:00 on the 27th to 02:00 on the 28th: 2 normal hours, 2 Eid hours.
    const quote = priceStay(rules, at(10 * HOUR), at(14 * HOUR));
    expect(quote.days).toEqual([
      expect.objectContaining({
        date: '2026-10-27',
        hours: 2,
        amount: 3000,
        label: null,
      }),
      expect.objectContaining({
        date: '2026-10-28',
        hours: 2,
        amount: 5000,
        label: 'Eid',
      }),
    ]);
    expect(quote.amount).toBe(8000);
    // A whole Eid day stops at the Eid cap, not the normal one.
    expect(
      priceStay(rules, at(12 * HOUR), at(36 * HOUR)).days[0],
    ).toMatchObject({
      date: '2026-10-28',
      hours: 24,
      amount: 15000,
      capped: true,
    });
  });

  it('can have no cap on override days', () => {
    const rules = { ...capped, overrides: [{ ...eid, daily_cap: null }] };
    expect(priceStay(rules, at(12 * HOUR), at(22 * HOUR)).amount).toBe(25000);
  });
});

describe('extensionCost', () => {
  it('charges the extra hours', () => {
    expect(extensionCost(plain, at(0), at(2 * HOUR), at(4 * HOUR))).toBe(3000);
  });

  it('charges nothing more once the day is at its cap', () => {
    expect(extensionCost(capped, at(0), at(5 * HOUR), at(8 * HOUR))).toBe(1500);
    expect(extensionCost(capped, at(0), at(6 * HOUR), at(9 * HOUR))).toBe(0);
  });
});

describe('priceOn', () => {
  it('uses the override covering the date, both ends included', () => {
    const rules = { ...capped, overrides: [eid] };
    expect(priceOn(rules, '2026-10-27').label).toBeNull();
    expect(priceOn(rules, '2026-10-28').price_per_hour).toBe(2500);
    expect(priceOn(rules, '2026-10-29').price_per_hour).toBe(2500);
    expect(priceOn(rules, '2026-10-30').price_per_hour).toBe(1500);
  });
});

describe('rulesFrom / bookingRules', () => {
  it('keeps only the overrides that have not ended', () => {
    const past = {
      ...eid,
      label: 'Past',
      start_date: '2026-10-01',
      end_date: '2026-10-26',
    };
    const today = {
      ...eid,
      label: 'Today',
      start_date: '2026-10-27',
      end_date: '2026-10-27',
    };
    const rules = rulesFrom(
      { price_per_hour: 1500, daily_cap: 9000 },
      [past, today, eid],
      at(0),
    );
    expect(rules.overrides.map((rule) => rule.label)).toEqual(['Today', 'Eid']);
  });

  it('falls back to the plain hourly price for bookings saved without rules', () => {
    expect(bookingRules({ price_rules: null, price_per_hour: 1000 })).toEqual({
      price_per_hour: 1000,
      daily_cap: null,
      overrides: [],
    });
  });
});
