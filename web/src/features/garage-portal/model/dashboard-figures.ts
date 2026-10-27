import { percentChange } from '@/shared/lib/numbers'

/*
 * Pure helpers for the owner's dashboard, kept out of the page so they are
 * easy to test.
 */

export type Comparison =
  { kind: 'none' } | { kind: 'same' } | { kind: 'up' | 'down'; percent: number }

/**
 * Today against yesterday, this week against last week. 'none' when there is
 * nothing to compare with ("+∞%" helps nobody).
 */
export function compare(current: number | null, previous: number | null): Comparison {
  if (current === null || previous === null) return { kind: 'none' }
  const change = percentChange(current, previous)
  if (change === null) return { kind: 'none' }
  if (change === 0) return { kind: 'same' }
  return change > 0 ? { kind: 'up', percent: change } : { kind: 'down', percent: -change }
}

/** 135 -> { hours: 2, minutes: 15 } */
export function splitMinutes(total: number): { hours: number; minutes: number } {
  const rounded = Math.max(0, Math.round(total))
  return { hours: Math.floor(rounded / 60), minutes: rounded % 60 }
}
