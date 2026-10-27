import { percentChange } from '@/shared/lib/numbers'

/*
 * Pure helpers for the numbers on the garage page, kept out of the components
 * so they are easy to test. Level helpers live in shared/lib/levels.
 */

/**
 * Change against the previous period, in whole percent. null when there is no
 * previous revenue to compare with ("+∞%" helps nobody).
 */
export function revenueChange(current: number, previous: number): number | null {
  return percentChange(current, previous)
}

/** The spot on OpenStreetMap (free, no key), zoomed to street level. */
export function mapLink(latitude: number, longitude: number): string {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`
}
