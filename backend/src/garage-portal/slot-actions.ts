import type { SlotStatus } from 'src/parking/entities/parking-slot.entity';

/**
 * What an owner can do to one slot from the Live Slots page:
 * - block:   take a free slot out of service (maintenance, a spill...)
 * - release: make it free again, after a block, or after a car that parked
 *            without a booking has left
 * A slot with an active booking is never touched here: it frees itself when
 * the booking ends, so the driver who paid for it can't lose it.
 */
export type SlotAction = 'block' | 'release';

export const SLOT_ACTION_TARGET: Record<SlotAction, SlotStatus> = {
  block: 'blocked',
  release: 'free',
};

/** The statuses each action may start from. */
export const SLOT_ACTION_FROM: Record<SlotAction, SlotStatus[]> = {
  block: ['free'],
  release: ['blocked', 'occupied'],
};

export type SlotActionCheck =
  | 'allowed'
  /** Already there: nothing to do (a double click, or another tab). */
  | 'unchanged'
  /** Reserved by a driver's active booking. */
  | 'booked'
  /** A car is parked without a booking: release it first. */
  | 'occupied';

export function checkSlotAction(
  current: SlotStatus,
  action: SlotAction,
): SlotActionCheck {
  if (current === SLOT_ACTION_TARGET[action]) return 'unchanged';
  if (SLOT_ACTION_FROM[action].includes(current)) return 'allowed';
  return current === 'reserved' ? 'booked' : 'occupied';
}
