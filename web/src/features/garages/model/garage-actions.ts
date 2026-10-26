import type { GarageStatus } from './garage.schemas'

export type GarageAction = 'approve' | 'suspend' | 'restore'

/**
 * The one action offered for each status. Same rules as the backend
 * (backend/src/parking/garage-status.ts), which has the final say.
 */
export const ACTION_FOR_STATUS: Readonly<Record<GarageStatus, GarageAction>> = {
  pending: 'approve',
  approved: 'suspend',
  suspended: 'restore',
}

/** Actions that take a garage out of the app ask for confirmation first. */
export function needsConfirmation(action: GarageAction): boolean {
  return action === 'suspend'
}
