import { checkSlotAction } from './slot-actions';

describe('checkSlotAction', () => {
  it('blocks only a free slot', () => {
    expect(checkSlotAction('free', 'block')).toBe('allowed');
    expect(checkSlotAction('blocked', 'block')).toBe('unchanged');
    expect(checkSlotAction('reserved', 'block')).toBe('booked');
    expect(checkSlotAction('occupied', 'block')).toBe('occupied');
  });

  it('releases a blocked slot or one a walk-in car has left', () => {
    expect(checkSlotAction('blocked', 'release')).toBe('allowed');
    expect(checkSlotAction('occupied', 'release')).toBe('allowed');
    expect(checkSlotAction('free', 'release')).toBe('unchanged');
  });

  it("never frees a driver's booked slot", () => {
    expect(checkSlotAction('reserved', 'release')).toBe('booked');
  });
});
