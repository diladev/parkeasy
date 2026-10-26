/**
 * pending   -> added, waiting for an admin to approve it; hidden from the app
 * approved  -> listed in the app and bookable
 * suspended -> hidden from the app by an admin; bookings already made continue
 *
 * Removing a lot is separate (is_available = false): it leaves the admin list too.
 */
export const GARAGE_STATUSES = ['pending', 'approved', 'suspended'] as const;
export type GarageStatus = (typeof GARAGE_STATUSES)[number];

/** What an admin can do to a garage, and from which status. */
export const GARAGE_ACTIONS = {
  approve: { from: ['pending'], to: 'approved' },
  suspend: { from: ['approved'], to: 'suspended' },
  restore: { from: ['suspended'], to: 'approved' },
} as const satisfies Record<
  string,
  { from: readonly GarageStatus[]; to: GarageStatus }
>;
export type GarageAction = keyof typeof GARAGE_ACTIONS;

/** The status after `action`, or null when the action doesn't apply. */
export function nextGarageStatus(
  current: GarageStatus,
  action: GarageAction,
): GarageStatus | null {
  const rule = GARAGE_ACTIONS[action];
  return (rule.from as readonly GarageStatus[]).includes(current)
    ? rule.to
    : null;
}
