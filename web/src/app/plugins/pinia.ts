import { createPinia, type Pinia } from 'pinia'
import type { App } from 'vue'

export function installPinia(app: App): Pinia {
  const pinia = createPinia()
  app.use(pinia)
  return pinia
}
