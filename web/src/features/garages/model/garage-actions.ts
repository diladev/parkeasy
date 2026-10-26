import type { GarageStatus } from './garage.schemas'

export type GarageAction = 'approve' | 'suspend' | 'restore'

/**
 * The status change offered for each status, on the garage page. Same rules as
 * the backend (backend/src/parking/garage-status.ts), which has the final say.
 */
export const ACTION_FOR_STATUS: Readonly<Record<GarageStatus, GarageAction>> = {
  pending: 'approve',
  approved: 'suspend',
  suspended: 'restore',
}

/**
 * The list's row button (as in the Figma design): approve and restore right
 * there, but suspending happens on the garage page, after seeing its details.
 */
export type ListAction = 'approve' | 'restore' | 'view'

export const LIST_ACTION: Readonly<Record<GarageStatus, ListAction>> = {
  pending: 'approve',
  approved: 'view',
  suspended: 'restore',
}

/** Actions that take a garage out of the app ask for confirmation first. */
export function needsConfirmation(action: GarageAction): boolean {
  return action === 'suspend'
}
