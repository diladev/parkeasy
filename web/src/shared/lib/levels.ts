/*
 * Garage levels and how full they are, shared by the Admin Panel's garage page
 * and the Garage Portal's dashboard.
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
