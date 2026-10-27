import type { RouteRecordRaw } from 'vue-router'

/** Mounted inside the Garage Portal's sidebar layout at /garage by app/router. */
export const garagePortalRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'garage.dashboard',
    component: () => import('./pages/DashboardPage.vue'),
    meta: { title: 'nav.dashboard', icon: 'i-lucide-layout-dashboard', menuOrder: 10 },
  },
  {
    path: 'slots',
    name: 'garage.slots',
    component: () => import('./pages/LiveSlotsPage.vue'),
    meta: { title: 'nav.liveSlots', icon: 'i-lucide-layout-grid', menuOrder: 20 },
  },
]
