import { compareLevels, slotNumbers } from './levels';

describe('compareLevels', () => {
  it('orders levels from the top floor down to the lowest basement', () => {
    expect(['B1', 'G', 'F2', 'B2', 'F1'].sort(compareLevels)).toEqual([
      'F2',
      'F1',
      'G',
      'B1',
      'B2',
    ]);
  });

  it('puts unknown level names last', () => {
    expect(['Roof', 'G', 'B1'].sort(compareLevels)).toEqual([
      'G',
      'B1',
      'Roof',
    ]);
  });
});

describe('slotNumbers', () => {
  it('numbers slots from A01 and keeps going past 99', () => {
    expect(slotNumbers(3)).toEqual(['A01', 'A02', 'A03']);
    expect(slotNumbers(100).slice(-2)).toEqual(['A99', 'A100']);
    expect(slotNumbers(0)).toEqual([]);
  });
});
