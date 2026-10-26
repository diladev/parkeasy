import type { RouteRecordRaw } from 'vue-router'

/**
 * Mounted inside the admin shell (/admin). The garage page is a child of the
 * list, so the "Garages" menu item stays highlighted while it is open.
 */
export const adminGaragesRoutes: RouteRecordRaw[] = [
  {
    path: 'garages',
    meta: { title: 'nav.garages', icon: 'i-lucide-warehouse', menuOrder: 20 },
    children: [
      {
        path: '',
        name: 'admin.garages',
        component: () => import('./pages/GaragesPage.vue'),
      },
      {
        // Digits only: /admin/garages/abc is a "page not found", not a broken request.
        path: ':id(\\d+)',
        name: 'admin.garages.detail',
        component: () => import('./pages/GarageDetailPage.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'garages.detail.title', parent: 'admin.garages', hideInMenu: true },
      },
    ],
  },
]
