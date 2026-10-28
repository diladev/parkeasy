import { capBelowPrice, checkPrices, daysInRange } from './price-settings';

const TODAY = '2026-10-28';
type Override = {
  label: string;
  start_date: string;
  end_date: string;
  price_per_hour: number;
  daily_cap: number | null;
};

const eid: Override = {
  label: 'Eid',
  start_date: '2026-11-10',
  end_date: '2026-11-12',
  price_per_hour: 2500,
  daily_cap: 15000,
};
const prices = (
  overrides: Override[] = [eid],
  daily_cap: number | null = 9000,
) => ({
  price_per_hour: 1500,
  daily_cap,
  price_overrides: overrides,
});

describe('checkPrices', () => {
  it('accepts sensible prices, with or without caps', () => {
    expect(checkPrices(prices(), TODAY)).toBeNull();
    expect(checkPrices(prices([], null), TODAY)).toBeNull();
    expect(
      checkPrices(prices([{ ...eid, daily_cap: null }]), TODAY),
    ).toBeNull();
    // Ongoing: started before today, ends today.
    expect(
      checkPrices(
        prices([{ ...eid, start_date: '2026-10-26', end_date: TODAY }]),
        TODAY,
      ),
    ).toBeNull();
  });

  it("refuses a cap below one hour's price", () => {
    expect(checkPrices(prices([], 1000), TODAY)).toEqual({
      key: 'DAILY_CAP_BELOW_PRICE',
    });
    expect(
      checkPrices(prices([{ ...eid, daily_cap: 2000 }]), TODAY),
    ).toMatchObject({ key: 'PRICE_OVERRIDE_CAP_BELOW_PRICE' });
  });

  it('refuses dates that are backwards, over or too long', () => {
    const check = (start_date: string, end_date: string) =>
      checkPrices(prices([{ ...eid, start_date, end_date }]), TODAY)?.key;
    expect(check('2026-11-12', '2026-11-10')).toBe('PRICE_OVERRIDE_DATES');
    expect(check('2026-10-20', '2026-10-27')).toBe('PRICE_OVERRIDE_ENDED');
    expect(check('2026-11-01', '2026-12-02')).toBe('PRICE_OVERRIDE_TOO_LONG');
    expect(check('2026-11-01', '2026-12-01')).toBeUndefined();
  });

  it('refuses two special prices on the same day', () => {
    const newroz = {
      ...eid,
      label: 'Newroz',
      start_date: '2026-11-12',
      end_date: '2026-11-13',
    };
    expect(checkPrices(prices([newroz, eid]), TODAY)).toEqual({
      key: 'PRICE_OVERRIDE_OVERLAP',
      args: { first: 'Eid', second: 'Newroz' },
    });
    expect(
      checkPrices(
        prices([eid, { ...newroz, start_date: '2026-11-13' }]),
        TODAY,
      ),
    ).toBeNull();
  });
});

describe('helpers', () => {
  it('counts both ends of a range', () => {
    expect(daysInRange('2027-03-20', '2027-03-22')).toBe(3);
    expect(daysInRange('2026-10-28', '2026-10-28')).toBe(1);
  });

  it('treats no cap as never below the price', () => {
    expect(capBelowPrice(1500, null)).toBe(false);
    expect(capBelowPrice(1500, undefined)).toBe(false);
    expect(capBelowPrice(1500, 1500)).toBe(false);
    expect(capBelowPrice(1500, 1499)).toBe(true);
  });
});
