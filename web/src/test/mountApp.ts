import ui from '@nuxt/ui/vue-plugin'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { App as VueApp } from 'vue'
import { createMemoryHistory } from 'vue-router'

import App from '@/app/App.vue'
import { installI18n, setLocale } from '@/app/plugins/i18n'
import { createQueryClient, installQuery } from '@/app/plugins/query'
import { createAppRouter } from '@/app/router'
import { recheckAccess } from '@/app/router/access'
import { useSessionStore } from '@/features/auth'
import { tokenStore } from '@/shared/auth/token-store'

type MeResponse = NonNullable<ReturnType<typeof useSessionStore>['me']>

/**
 * Mounts the real app (router, guards, stores, Nuxt UI, i18n) at `path`, with
 * the network mocked by MSW. For tests that should behave like a user.
 */
export async function mountApp(
  path: string,
  options: { locale?: 'en' | 'ckb'; signedInAs?: MeResponse } = {},
) {
  const { locale = 'en', signedInAs } = options
  const pinia = createPinia()
  setActivePinia(pinia)
  if (signedInAs) {
    tokenStore.set('test-access-token')
    useSessionStore().me = signedInAs
  }
  setLocale(locale)
  const router = createAppRouter(createMemoryHistory())
  // A fresh cache per test, so no data leaks from one test into the next.
  const queryClient = createQueryClient({ onForbidden: recheckAccess(router) })

  await router.push(path)
  const wrapper = mount(App, {
    global: {
      plugins: [
        pinia,
        { install: installI18n },
        { install: (app: VueApp) => installQuery(app, queryClient) },
        ui,
        router,
      ],
    },
    attachTo: document.body,
  })
  await router.isReady()
  await flushPromises()
  return { wrapper, router, pinia, queryClient }
}
