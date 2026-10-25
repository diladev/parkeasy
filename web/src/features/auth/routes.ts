import type { RouteRecordRaw } from 'vue-router'

/** Mounted under /admin by app/router. */
export const adminAuthRoutes: RouteRecordRaw[] = [
  {
    path: 'login',
    name: 'admin.login',
    component: () => import('./pages/AdminLoginPage.vue'),
    meta: { public: true, guestOnly: true, title: 'auth.login.title' },
  },
]
