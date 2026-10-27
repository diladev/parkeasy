import { watchEffect } from 'vue'

import { activePortal } from '../router/portal'

/** Purple for the Admin Panel, teal for the Garage Portal (see styles/main.css). */
export function usePortalTheme(): void {
  watchEffect(() => {
    document.documentElement.dataset.portal = activePortal.value
  })
}
