import type { RouteRecordRaw } from 'vue-router'

/** Mounted inside the admin shell (/admin). */
export const adminGaragesRoutes: RouteRecordRaw[] = [
  {
    path: 'garages',
    name: 'admin.garages',
    component: () => import('./pages/GaragesPage.vue'),
    meta: { title: 'nav.garages', icon: 'i-lucide-warehouse', menuOrder: 20 },
  },
]
