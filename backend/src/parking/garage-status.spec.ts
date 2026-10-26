import { nextGarageStatus } from './garage-status';

describe('nextGarageStatus', () => {
  it.each([
    ['pending', 'approve', 'approved'],
    ['approved', 'suspend', 'suspended'],
    ['suspended', 'restore', 'approved'],
  ] as const)('%s + %s -> %s', (current, action, expected) => {
    expect(nextGarageStatus(current, action)).toBe(expected);
  });

  it.each([
    ['approved', 'approve'],
    ['suspended', 'approve'],
    ['pending', 'suspend'],
    ['suspended', 'suspend'],
    ['pending', 'restore'],
    ['approved', 'restore'],
  ] as const)('refuses %s + %s', (current, action) => {
    expect(nextGarageStatus(current, action)).toBeNull();
  });
});
