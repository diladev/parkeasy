import { z } from 'zod'

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

/** What is going on in a slot, which decides what the details panel offers. */
export type SlotSituation =
  /** Free: start a walk-in, or block it. */
  | 'free'
  /** A driver's app booking: nothing to do, it frees itself. */
  | 'booked'
  /** A car parked without the app, recorded with its plate: end and charge. */
  | 'walk-in'
  /** Occupied with no record (e.g. from before walk-ins existed): mark it free. */
  | 'occupied'
  /** Out of service: put it back. */
  | 'blocked'

export function situationOf(slot: LiveSlot): SlotSituation {
  if (slot.booking) return slot.booking.source === 'walk_in' ? 'walk-in' : 'booked'
  if (slot.status === 'reserved') return 'booked'
  return slot.status
}

export interface SlotActionOption {
  action: SlotAction
  /** i18n key under garagePortal.slots.actions */
  label: 'block' | 'unblock' | 'markFree'
}

/**
 * The block/release action for a slot (the same rules as
 * backend/src/garage-portal/slot-actions.ts). A slot held by a booking or a
 * walk-in has none: those have their own buttons, or none at all.
 */
export function slotActionFor(slot: LiveSlot): SlotActionOption | null {
  switch (situationOf(slot)) {
    case 'free':
      return { action: 'block', label: 'block' }
    case 'blocked':
      return { action: 'release', label: 'unblock' }
    case 'occupied':
      return { action: 'release', label: 'markFree' }
    default:
      return null
  }
}

/**
 * A plate as the backend accepts it (create-vehicle.dto.ts): letters of any
 * alphabet, digits, spaces and dashes, 2 to 15 characters. Spaces are tidied
 * and letters upper-cased first, as the server does.
 */
export function createPlateSchema(message: string) {
  return z.object({
    plate: z
      .string()
      .transform((value) => value.trim().replace(/\s+/g, ' ').toUpperCase())
      .pipe(z.string().regex(/^[\p{L}\p{N}][\p{L}\p{N}\s-]{1,14}$/u, { error: message })),
  })
}

/** Minutes since `start`, for "parked for 1h 20m". */
export function minutesSince(start: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60_000))
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
