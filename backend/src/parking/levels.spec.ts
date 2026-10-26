import { compareLevels } from './levels';

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
