import { nextUserStatus } from './user-status';

describe('nextUserStatus', () => {
  it('suspends an active account and restores a suspended one', () => {
    expect(nextUserStatus('active', 'suspend')).toBe('suspended');
    expect(nextUserStatus('suspended', 'restore')).toBe('active');
  });

  it('refuses actions that do not fit the current status', () => {
    expect(nextUserStatus('suspended', 'suspend')).toBeNull();
    expect(nextUserStatus('active', 'restore')).toBeNull();
    expect(nextUserStatus('inactive', 'restore')).toBeNull();
  });
});
