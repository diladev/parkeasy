import ui from '@nuxt/ui/vue-plugin'
import type { App } from 'vue'

/** Nuxt UI: components, icons (bundled at build time) and head management. */
export function installUi(app: App): void {
  app.use(ui)
}
