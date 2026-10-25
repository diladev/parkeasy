import { describe, expect, it } from 'vitest'
import type { RouteRecordRaw } from 'vue-router'

import { buildMenu } from './buildMenu'

const page = { render: () => null }

const routes: RouteRecordRaw[] = [
  {
    path: 'users',
    meta: {
      title: 'nav.users',
      icon: 'i-lucide-users',
      permissions: ['users.read'],
      menuOrder: 20,
    },
    children: [
      { path: '', name: 'users.list', component: page },
      {
        path: ':id',
        name: 'users.detail',
        component: page,
        meta: { title: 'x', hideInMenu: true },
      },
    ],
  },
  {
    path: '',
    name: 'admin.overview',
    component: page,
    meta: { title: 'nav.overview', icon: 'i-lucide-layout-dashboard', menuOrder: 10 },
  },
  {
    path: 'secret',
    name: 'secret',
    component: page,
    meta: { title: 'nav.secret', permissions: ['root'] },
  },
]

const canAll = () => true
const grants =
  (...granted: string[]) =>
  (required?: string[]) =>
    (required ?? []).every((permission) => granted.includes(permission))

describe('buildMenu', () => {
  it('orders items and turns a parent with an untitled index child into a link', () => {
    expect(buildMenu(routes, canAll, '/admin')).toEqual([
      {
        key: 'admin.overview',
        title: 'nav.overview',
        icon: 'i-lucide-layout-dashboard',
        path: '/admin',
      },
      { key: '/admin/users', title: 'nav.users', icon: 'i-lucide-users', path: '/admin/users' },
      { key: 'secret', title: 'nav.secret', icon: undefined, path: '/admin/secret' },
    ])
  })

  it('leaves out pages the user may not open', () => {
    expect(buildMenu(routes, grants(), '/admin').map((item) => item.key)).toEqual([
      'admin.overview',
    ])
    expect(buildMenu(routes, grants('users.read'), '/admin').map((item) => item.key)).toEqual([
      'admin.overview',
      '/admin/users',
    ])
  })

  it('hoists the children of an untitled layout route', () => {
    const wrapped: RouteRecordRaw[] = [{ path: '', component: page, children: routes.slice(1, 2) }]
    expect(buildMenu(wrapped, canAll, '/admin')).toHaveLength(1)
  })
})
