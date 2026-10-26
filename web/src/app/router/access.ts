import type { Router } from 'vue-router'

import { useCan, useSessionStore } from '@/features/auth'

/**
 * For a 403 from the API. It usually means the role changed since sign-in, so
 * ask the server again (GET /me) and leave the page if access to it is gone.
 * Otherwise the page shows the error itself.
 */
export function recheckAccess(router: Router): () => void {
  let running = false
  return () => {
    if (running) return
    running = true
    void useSessionStore()
      .refreshMe()
      .catch(() => undefined)
      .then(async () => {
        const required = router.currentRoute.value.matched.flatMap(
          (record) => record.meta.permissions ?? [],
        )
        if (!useCan().can(required)) await router.replace({ name: 'forbidden' })
      })
      .finally(() => {
        running = false
      })
  }
}
