import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

import { PERMISSIONS, safeRedirect, useCan, useSessionStore, type Portal } from '@/features/auth'

interface PortalRoutes {
  login: string
  home: string
  permission: string
}

const ADMIN_PORTAL: PortalRoutes = {
  login: 'admin.login',
  home: 'admin.overview',
  permission: PERMISSIONS.ADMIN_ACCESS,
}

/** The garage portal gets its own entry when it is built. */
const PORTALS: Partial<Record<Portal, PortalRoutes>> = { admin: ADMIN_PORTAL }
const DEFAULT_PORTAL = ADMIN_PORTAL

export function portalRoutesFor(route: RouteLocationNormalized): PortalRoutes {
  const portal = route.matched.find((record) => record.meta.portal)?.meta.portal
  return (portal && PORTALS[portal]) ?? DEFAULT_PORTAL
}

/** The sign-in page for `route`, coming back to it afterwards. */
export function loginLocationFor(
  route: RouteLocationNormalized,
  router: Router,
  reason?: 'expired',
): RouteLocationRaw {
  const { login, home } = portalRoutesFor(route)
  const isHome = route.fullPath === router.resolve({ name: home }).fullPath
  const query: Record<string, string> = {}
  if (!isHome && !route.meta.public) query.redirect = route.fullPath
  if (reason) query.reason = reason
  return { name: login, query }
}

/**
 * Decides what the UI shows. It protects nothing: the API checks the token and
 * the permission on every request (PermissionsGuard in the backend).
 */
export function installGuards(router: Router): void {
  router.beforeEach((to) => {
    const session = useSessionStore()
    const { can } = useCan()
    const portal = portalRoutesFor(to)

    // Signed in already: skip the sign-in page.
    if (to.meta.guestOnly && session.isAuthenticated && can(portal.permission)) {
      const home = router.resolve({ name: portal.home }).fullPath
      return safeRedirect(router, to.query.redirect, home)
    }

    const isPublic = to.matched.some((record) => record.meta.public)
    if (!isPublic && !session.isAuthenticated) return loginLocationFor(to, router)

    // `to.meta` is a shallow merge, so a child's `permissions` would replace its
    // parent's: collect them from every matched record instead.
    const required = to.matched.flatMap((record) => record.meta.permissions ?? [])
    if (!can(required)) return { name: 'forbidden' }

    return true
  })
}
