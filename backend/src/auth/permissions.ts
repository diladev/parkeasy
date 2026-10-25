/**
 * Who may do what. The server decides this from the user's role in the
 * database; clients only receive the resulting list (GET /user/local/me) to
 * shape their UI. Every protected route still checks it (PermissionsGuard).
 */

export const ROLES = ['driver', 'garage_owner', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** The web portals a person can sign in to. Drivers use the mobile app. */
export const PORTALS = ['admin', 'garage'] as const;
export type Portal = (typeof PORTALS)[number];

export const PERMISSIONS = {
  /** Sign in to the Admin Panel. */
  ADMIN_ACCESS: 'admin.access',
  /** Sign in to the Garage Portal. */
  GARAGE_ACCESS: 'garage.access',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  driver: [],
  garage_owner: [PERMISSIONS.GARAGE_ACCESS],
  admin: [PERMISSIONS.ADMIN_ACCESS],
};

const PORTAL_PERMISSION: Record<Portal, Permission> = {
  admin: PERMISSIONS.ADMIN_ACCESS,
  garage: PERMISSIONS.GARAGE_ACCESS,
};

const isRole = (value: string): value is Role =>
  (ROLES as readonly string[]).includes(value);

/** The permissions a role grants. An unknown role grants nothing. */
export function permissionsFor(role: string | null | undefined): Permission[] {
  return role && isRole(role) ? [...ROLE_PERMISSIONS[role]] : [];
}

/** True if every required permission is granted. Nothing required is always allowed. */
export function hasAllPermissions(
  granted: readonly string[],
  required: readonly string[],
): boolean {
  return required.every((permission) => granted.includes(permission));
}

/** Whether a role may sign in to a portal. */
export function canUsePortal(
  role: string | null | undefined,
  portal: Portal,
): boolean {
  return permissionsFor(role).includes(PORTAL_PERMISSION[portal]);
}
