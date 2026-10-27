import type { RouteRecordRaw } from 'vue-router'

import { adminAuthRoutes, garageAuthRoutes, PERMISSIONS } from '@/features/auth'
import { garagePortalRoutes } from '@/features/garage-portal'
import { adminGaragesRoutes } from '@/features/garages'
import { adminOverviewRoutes } from '@/features/overview'
import { adminUsersRoutes } from '@/features/users'

import AuthLayout from '../layouts/AuthLayout.vue'

/*
 * Everything inside a portal's sidebar layout. The sidebar menu is built from
 * these children (see navigation/buildMenu.ts), so a new page only needs a
 * route with meta.title and meta.icon.
 */
export const adminShellRoute: RouteRecordRaw = {
  path: '',
  component: () => import('../layouts/PortalLayout.vue'),
  props: { portal: 'admin' },
  meta: { permissions: [PERMISSIONS.ADMIN_ACCESS] },
  children: [...adminOverviewRoutes, ...adminGaragesRoutes, ...adminUsersRoutes],
}

export const garageShellRoute: RouteRecordRaw = {
  path: '',
  component: () => import('../layouts/PortalLayout.vue'),
  props: { portal: 'garage' },
  meta: { permissions: [PERMISSIONS.GARAGE_ACCESS] },
  children: [...garagePortalRoutes],
}

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: { name: 'admin.overview' } },
  {
    path: '/admin',
    meta: { portal: 'admin' },
    // The shell comes first: both groups have an empty path, and /admin itself
    // must resolve to the overview, not to the bare sign-in layout.
    children: [adminShellRoute, { path: '', component: AuthLayout, children: adminAuthRoutes }],
  },
  {
    path: '/garage',
    meta: { portal: 'garage' },
    children: [garageShellRoute, { path: '', component: AuthLayout, children: garageAuthRoutes }],
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
