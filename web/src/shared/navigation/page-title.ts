import { onScopeDispose, shallowRef, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

/**
 * A title set by the page itself, for pages whose name comes from data
 * ("City Center Parking") rather than from the route. The layout heading and
 * the browser tab use it instead of the route's title while it is set.
 */
export const pageTitle = shallowRef<string | null>(null)

/** Call from a page's setup; the title is cleared when the page goes away. */
export function usePageTitle(title: MaybeRefOrGetter<string | null | undefined>): void {
  watchEffect(() => {
    pageTitle.value = toValue(title) || null
  })
  onScopeDispose(() => {
    pageTitle.value = null
  })
}
