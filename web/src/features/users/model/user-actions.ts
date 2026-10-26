import type { Role, UserStatus } from './user.schemas'

export type UserAction = 'suspend' | 'restore'

/**
 * The status change offered on a user's page. Same rules as the backend
 * (backend/src/admin-users/user-status.ts), which has the final say: admin
 * accounts are never suspended from the panel.
 */
export function actionFor(user: { role: Role; status: UserStatus }): UserAction | null {
  if (user.role === 'admin') return null
  if (user.status === 'active') return 'suspend'
  if (user.status === 'suspended') return 'restore'
  return null
}

/** "Lana Rashid" -> "LR" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}
