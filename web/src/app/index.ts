import './styles/main.css'

import { createApp } from 'vue'

import { useSessionStore } from '@/features/auth'
import { onLoggedOut } from '@/shared/auth/auth-channel'

import App from './App.vue'
import { installErrorHandling } from './errors'
import { installI18n } from './plugins/i18n'
import { installPinia } from './plugins/pinia'
import { createQueryClient, installQuery } from './plugins/query'
import { installUi } from './plugins/ui'
import { createAppRouter } from './router'
import { recheckAccess } from './router/access'
import { loginLocationFor } from './router/guards'

export async function bootstrap(): Promise<void> {
  const app = createApp(App)
  const pinia = installPinia(app) // first: guards and plugins use stores
  installI18n(app)
  installUi(app)

  const router = createAppRouter()
  installErrorHandling(app, router)
  const session = useSessionStore(pinia)

  const queryClient = createQueryClient({ onForbidden: recheckAccess(router) })
  installQuery(app, queryClient)

  // Restore the session before the first navigation, so a signed-in admin who
  // reloads doesn't flash the sign-in page.
  await session.restore()

  // Signed out in another tab, or the session expired: back to the sign-in page.
  onLoggedOut((reason) => {
    session.reset()
    // The next person to sign in on this browser must not see this one's data.
    queryClient.clear()
    const current = router.currentRoute.value
    if (current.matched.some((record) => record.meta.public)) return
    void router.replace(
      loginLocationFor(current, router, reason === 'expired' ? 'expired' : undefined),
    )
  })

  app.use(router)
  await router.isReady()
  app.mount('#app')
}
