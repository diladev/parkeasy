import type { RouteLocationNormalized, RouteLocationRaw, Router } from 'vue-router'

import { safeRedirect, useCan, useSessionStore } from '@/features/auth'

import { activePortal, portalOf, PORTALS, type PortalRoutes } from './portal'

export function portalRoutesFor(route: RouteLocationNormalized): PortalRoutes {
  return PORTALS[portalOf(route) ?? activePortal.value]
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

    // Signed in already: skip the sign-in and reset pages.
    if (to.meta.guestOnly && session.isAuthenticated && can(portal.permission)) {
      const home = router.resolve({ name: portal.home }).fullPath
      return safeRedirect(router, to.query.redirect, home)
    }

    const isPublic = to.matched.some((record) => record.meta.public)
    if (!isPublic && !session.isAuthenticated) return loginLocationFor(to, router)

    // `to.meta` is a shallow merge, so a child's `permissions` would replace its
    // parent's: collect them from every matched record instead.
    const required = to.matched.flatMap((record) => record.meta.permissions ?? [])
    if (!can(required)) {
      // "No access" belongs to no portal: keep the one that was asked for, so
      // "Sign in with another account" opens the right sign-in page.
      activePortal.value = portalOf(to) ?? activePortal.value
      return { name: 'forbidden' }
    }

    return true
  })

  router.afterEach((to, _from, failure) => {
    if (!failure) activePortal.value = portalOf(to) ?? activePortal.value
  })
}
