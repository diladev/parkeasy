import { chargedHours, walkInCharge } from './pricing';

const at = (minutes: number) =>
  new Date(Date.UTC(2026, 9, 27, 9, 0) + minutes * 60_000);

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

describe('walkInCharge', () => {
  it('multiplies the hours by the hourly price', () => {
    expect(walkInCharge(1500, at(0), at(95))).toEqual({
      hours: 2,
      amount: 3000,
    });
  });
});
