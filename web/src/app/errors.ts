import type { App } from 'vue'
import type { Router } from 'vue-router'

const CHUNK_RELOAD_KEY = 'parkeasy.chunk-reload'

/**
 * Last line of defence for errors nothing else handled. API errors are shown
 * where they happen (forms, pages); this logs the rest. An error tracker
 * (GlitchTip/Sentry) plugs in here later.
 */
export function installErrorHandling(app: App, router: Router): void {
  app.config.errorHandler = (error, _instance, info) => {
    console.error(`[ParkEasy] Unhandled error (${info})`, error)
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[ParkEasy] Unhandled promise rejection', event.reason)
  })

  // After a deploy, an open tab may ask for page chunks that no longer exist.
  // Reload once to pick up the new build instead of showing a blank page.
  router.onError((error, to) => {
    const isStaleChunk =
      /Failed to fetch dynamically imported module|Importing a module script failed/.test(
        String(error),
      )
    if (!isStaleChunk) return
    try {
      if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
      sessionStorage.setItem(CHUNK_RELOAD_KEY, '1')
    } catch {
      return // No storage: don't risk a reload loop.
    }
    window.location.assign(to.fullPath)
  })

  router.afterEach(() => {
    try {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY)
    } catch {
      // Nothing to clean up.
    }
  })
}
