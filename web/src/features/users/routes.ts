import type { RouteRecordRaw } from 'vue-router'

/**
 * Mounted inside the admin shell (/admin). The user page is a child of the
 * list, so the "Users" menu item stays highlighted while it is open.
 */
export const adminUsersRoutes: RouteRecordRaw[] = [
  {
    path: 'users',
    meta: { title: 'nav.users', icon: 'i-lucide-users', menuOrder: 30 },
    children: [
      {
        path: '',
        name: 'admin.users',
        component: () => import('./pages/UsersPage.vue'),
      },
      {
        path: ':id(\\d+)',
        name: 'admin.users.detail',
        component: () => import('./pages/UserDetailPage.vue'),
        props: (route) => ({ id: Number(route.params.id) }),
        meta: { title: 'users.detail.title', parent: 'admin.users', hideInMenu: true },
      },
    ],
  },
]
