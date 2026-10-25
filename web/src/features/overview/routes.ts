import type { RouteRecordRaw } from 'vue-router'

/** Mounted inside the admin shell (/admin). */
export const adminOverviewRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'admin.overview',
    component: () => import('./pages/OverviewPage.vue'),
    meta: {
      title: 'nav.overview',
      heading: 'overview.title',
      icon: 'i-lucide-layout-dashboard',
      menuOrder: 10,
    },
  },
]
