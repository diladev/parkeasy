/**
 * Same names as backend/src/auth/permissions.ts. The server decides what a user
 * may do (GET /user/local/me) and enforces it on every endpoint; the UI only
 * uses these to decide what to show.
 */
export const PERMISSIONS = {
  ADMIN_ACCESS: 'admin.access',
  GARAGE_ACCESS: 'garage.access',
} as const

export type Permission = string

/** The portals a user can sign in to; the login request names one. */
export type Portal = 'admin' | 'garage'

/**
 * True when every (mode 'all') or at least one (mode 'any') required permission
 * is granted. Nothing required means allowed. `resource.*` and `*` grant a
 * whole group, so the backend can add wildcards later without UI changes.
 */
export function hasPermission(
  granted: ReadonlySet<Permission>,
  required: Permission | readonly Permission[] | undefined,
  mode: 'all' | 'any' = 'all',
): boolean {
  const list: readonly Permission[] =
    required === undefined ? [] : typeof required === 'string' ? [required] : required
  if (list.length === 0) return true

  const isGranted = (permission: Permission): boolean => {
    if (granted.has('*') || granted.has(permission)) return true
    const [resource] = permission.split('.')
    return granted.has(`${resource}.*`)
  }
  return mode === 'all' ? list.every(isGranted) : list.some(isGranted)
}
