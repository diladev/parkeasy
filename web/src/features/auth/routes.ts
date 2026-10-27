import type { RouteRecordRaw } from 'vue-router'

import type { Portal } from './model/permissions'

/** Sign-in and password reset for one portal; mounted under /admin and /garage by app/router. */
function authRoutes(portal: Portal): RouteRecordRaw[] {
  return [
    {
      path: 'login',
      name: `${portal}.login`,
      component: () => import('./pages/LoginPage.vue'),
      props: { portal },
      meta: { public: true, guestOnly: true, title: 'auth.login.title' },
    },
    {
      path: 'forgot-password',
      name: `${portal}.forgot`,
      component: () => import('./pages/ForgotPasswordPage.vue'),
      props: { portal },
      meta: { public: true, guestOnly: true, title: 'auth.forgot.title' },
    },
  ]
}

export const adminAuthRoutes = authRoutes('admin')
export const garageAuthRoutes = authRoutes('garage')
