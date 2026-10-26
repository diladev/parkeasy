import type { LocationQuery } from 'vue-router'

/** `?q=a&q=b` arrives as an array and `?q` as null: take the first real string, if any. */
export function firstQueryValue(value: LocationQuery[string] | undefined): string | undefined {
  const item = Array.isArray(value) ? value[0] : value
  return typeof item === 'string' ? item : undefined
}
