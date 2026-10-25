import type { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
  key: string
  /** i18n key */
  title: string
  icon?: string
  path?: string
  children?: MenuItem[]
}

const join = (base: string, path: string) =>
  path.startsWith('/') ? path : `${base.replace(/\/$/, '')}/${path}`.replace(/\/+$/, '') || '/'

/**
 * The sidebar comes from the routes themselves, so the two can't drift apart:
 * a page the user may not open never shows up as a link.
 */
export function buildMenu(
  routes: readonly RouteRecordRaw[],
  can: (permissions?: string[]) => boolean,
  base = '/',
): MenuItem[] {
  const items: (MenuItem & { order: number })[] = []
  for (const route of routes) {
    const path = join(base, route.path)
    if (route.meta?.hideInMenu || !can(route.meta?.permissions)) continue
    const children = route.children ? buildMenu(route.children, can, path) : []

    if (!route.meta?.title) {
      // A layout wrapper without its own entry: show its children instead.
      items.push(...children.map((child) => ({ ...child, order: 999 })))
      continue
    }
    items.push({
      key: String(route.name ?? path),
      title: route.meta.title,
      icon: route.meta.icon,
      path: children.length > 0 ? undefined : path,
      children: children.length > 0 ? children : undefined,
      order: route.meta.menuOrder ?? 999,
    })
  }
  return items.sort((a, b) => a.order - b.order).map(({ order: _order, ...item }) => item)
}
