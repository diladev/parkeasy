import {
  canUsePortal,
  hasAllPermissions,
  PERMISSIONS,
  permissionsFor,
} from './permissions';

describe('permissions', () => {
  it('gives drivers nothing on the web', () => {
    expect(permissionsFor('driver')).toEqual([]);
  });

  it('gives each portal role its own access', () => {
    expect(permissionsFor('admin')).toContain(PERMISSIONS.ADMIN_ACCESS);
    expect(permissionsFor('garage_owner')).toContain(PERMISSIONS.GARAGE_ACCESS);
    expect(permissionsFor('admin')).not.toContain(PERMISSIONS.GARAGE_ACCESS);
  });

  it('grants nothing for an unknown or missing role', () => {
    expect(permissionsFor('superuser')).toEqual([]);
    expect(permissionsFor(undefined)).toEqual([]);
    expect(permissionsFor(null)).toEqual([]);
  });

  it('returns a copy, so callers cannot change the role table', () => {
    permissionsFor('admin').push(PERMISSIONS.GARAGE_ACCESS);
    expect(permissionsFor('admin')).not.toContain(PERMISSIONS.GARAGE_ACCESS);
  });

  it.each([
    [['admin.access'], ['admin.access'], true],
    [['admin.access'], [], true],
    [[], ['admin.access'], false],
    [['admin.access'], ['admin.access', 'users.read'], false],
  ])('granted %j, required %j → %s', (granted, required, expected) => {
    expect(hasAllPermissions(granted, required)).toBe(expected);
  });

  it('lets only the matching role into each portal', () => {
    expect(canUsePortal('admin', 'admin')).toBe(true);
    expect(canUsePortal('garage_owner', 'garage')).toBe(true);
    expect(canUsePortal('driver', 'admin')).toBe(false);
    expect(canUsePortal('driver', 'garage')).toBe(false);
    expect(canUsePortal('garage_owner', 'admin')).toBe(false);
  });
});
