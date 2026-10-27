import { percentChange } from '@/shared/lib/numbers'

/*
 * Pure helpers for the numbers on the garage page, kept out of the components
 * so they are easy to test.
 */

/** Whole percent, 0 when there is nothing to divide by. */
export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0
}

/** Bar colour for how full a level is (same thresholds as the Figma design). */
export function occupancyColor(percentTaken: number): 'error' | 'warning' | 'success' {
  if (percentTaken >= 80) return 'error'
  if (percentTaken >= 60) return 'warning'
  return 'success'
}

/**
 * Change against the previous period, in whole percent. null when there is no
 * previous revenue to compare with ("+∞%" helps nobody).
 */
export function revenueChange(current: number, previous: number): number | null {
  return percentChange(current, previous)
}

export type LevelName =
  | { kind: 'ground' }
  | { kind: 'basement'; number: number }
  | { kind: 'floor'; number: number }
  | { kind: 'other'; name: string }

/** "B2" -> basement 2, "G" -> ground, "F1" -> floor 1 (see LEVEL_PATTERN in the backend). */
export function parseLevel(level: string): LevelName {
  if (level === 'G') return { kind: 'ground' }
  const match = /^([BF])(\d+)$/.exec(level)
  if (!match) return { kind: 'other', name: level }
  const number = Number(match[2])
  return match[1] === 'B' ? { kind: 'basement', number } : { kind: 'floor', number }
}

/** The spot on OpenStreetMap (free, no key), zoomed to street level. */
export function mapLink(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}
