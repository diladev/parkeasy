import ui from '@nuxt/ui/vue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'

import App from '@/app/App.vue'
import { installI18n, setLocale } from '@/app/plugins/i18n'
import { createAppRouter } from '@/app/router'

/**
 * Mounts the real app (router, guards, stores, Nuxt UI, i18n) at `path`, with
 * the network mocked by MSW. For tests that should behave like a user.
 */
export async function mountApp(path: string, locale: 'en' | 'ckb' = 'en') {
  const pinia = createPinia()
  setActivePinia(pinia)
  setLocale(locale)
  const router = createAppRouter(createMemoryHistory())

  await router.push(path)
  const wrapper = mount(App, {
    global: { plugins: [pinia, { install: installI18n }, ui, router] },
    attachTo: document.body,
  })
  await router.isReady()
  await flushPromises()
  return { wrapper, router, pinia }
}
