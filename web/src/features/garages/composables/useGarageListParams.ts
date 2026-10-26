import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { parseListParams, toRouteQuery, type GarageListParams } from '../model/list-params'

/** Reads and writes the Garages list state in the URL. */
export function useGarageListParams() {
  const route = useRoute()
  const router = useRouter()

  const params = computed(() => parseListParams(route.query))

  /**
   * A new status or search starts again at page 1. `replace` is for typing in
   * the search box, so Back doesn't step through every letter.
   */
  function update(changes: Partial<GarageListParams>, options: { replace?: boolean } = {}) {
    const next: GarageListParams = { ...params.value, ...changes }
    if (changes.page === undefined && ('status' in changes || 'q' in changes)) next.page = 1
    const location = { query: toRouteQuery(next) }
    return options.replace ? router.replace(location) : router.push(location)
  }

  return { params, update }
}
