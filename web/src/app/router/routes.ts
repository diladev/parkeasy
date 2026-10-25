import type { RouteRecordRaw } from 'vue-router'

import { adminAuthRoutes, PERMISSIONS } from '@/features/auth'
import { adminOverviewRoutes } from '@/features/overview'

import AuthLayout from '../layouts/AuthLayout.vue'

/**
 * Everything inside the admin sidebar layout. The sidebar menu is built from
 * these children (see navigation/buildMenu.ts), so a new admin page only needs
 * a route with meta.title and meta.icon.
 */
export const adminShellRoute: RouteRecordRaw = {
  path: '',
  component: () => import('../layouts/AdminLayout.vue'),
  meta: { permissions: [PERMISSIONS.ADMIN_ACCESS] },
  children: [...adminOverviewRoutes],
}

export const routes: RouteRecordRaw[] = [
  // Only the admin portal exists so far; the garage portal will live at /garage.
  { path: '/', redirect: { name: 'admin.overview' } },
  {
    path: '/admin',
    meta: { portal: 'admin' },
    // The shell comes first: both groups have an empty path, and /admin itself
    // must resolve to the overview, not to the bare sign-in layout.
    children: [adminShellRoute, { path: '', component: AuthLayout, children: adminAuthRoutes }],
  },
  {
    path: '/forbidden',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'forbidden',
        component: () => import('../pages/ForbiddenPage.vue'),
        meta: { public: true, title: 'errors.forbidden.title' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'not-found',
        component: () => import('../pages/NotFoundPage.vue'),
        meta: { public: true, title: 'errors.notFound.title' },
      },
    ],
  },
]
