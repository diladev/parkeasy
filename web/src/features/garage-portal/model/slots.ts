import { SLOT_STATUSES, type LiveSlot, type SlotAction, type SlotStatus } from './portal.schemas'

/*
 * Pure helpers for the Live Slots page, kept out of the components so they
 * are easy to test.
 */

/** How many slots are in each state, every state present (0 when none). */
export function countByStatus(slots: readonly LiveSlot[]): Record<SlotStatus, number> {
  const counts = Object.fromEntries(SLOT_STATUSES.map((status) => [status, 0])) as Record<
    SlotStatus,
    number
  >
  for (const slot of slots) counts[slot.status]++
  return counts
}

export interface SlotActionOption {
  action: SlotAction
  /** i18n key under garagePortal.slots.actions */
  label: 'block' | 'unblock' | 'markFree'
}

/**
 * What the owner can do with a slot in this state (the same rules as
 * backend/src/garage-portal/slot-actions.ts). A booked slot has none: it
 * frees up by itself when the booking ends.
 */
export function slotActionFor(slot: LiveSlot): SlotActionOption | null {
  if (slot.booking) return null
  switch (slot.status) {
    case 'free':
      return { action: 'block', label: 'block' }
    case 'blocked':
      return { action: 'release', label: 'unblock' }
    case 'occupied':
      return { action: 'release', label: 'markFree' }
    case 'reserved':
      return null
  }
}

/** Colours per state for the tiles and the legend. Colour is never the only cue: tiles say it too. */
export const SLOT_TONE: Record<SlotStatus, { tile: string; text: string; dot: string }> = {
  free: {
    tile: 'border-success/40 bg-success/10',
    text: 'text-success',
    dot: 'bg-success',
  },
  reserved: {
    tile: 'border-warning/40 bg-warning/10',
    text: 'text-warning',
    dot: 'bg-warning',
  },
  occupied: {
    tile: 'border-error/40 bg-error/10',
    text: 'text-error',
    dot: 'bg-error',
  },
  blocked: {
    tile: 'border-dashed border-accented bg-elevated',
    text: 'text-muted',
    dot: 'bg-(--ui-text-dimmed)',
  },
}
