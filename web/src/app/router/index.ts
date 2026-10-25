import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'

import { installGuards } from './guards'
import { routes } from './routes'

export function createAppRouter(
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
  })
  installGuards(router)
  return router
}
