export interface Debounced<Args extends unknown[]> {
  (...args: Args): void
  /** Drops a call that is still waiting. */
  cancel: () => void
}

/** Calls `fn` once the calls stop for `wait` ms (e.g. search while typing). */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  wait: number,
): Debounced<Args> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const debounced = (...args: Args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
  debounced.cancel = () => clearTimeout(timer)
  return debounced
}
