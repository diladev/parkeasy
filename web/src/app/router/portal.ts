import { ref } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

import { PERMISSIONS, type Portal } from '@/features/auth'

export interface PortalRoutes {
  login: string
  forgot: string
  home: string
  permission: string
}

/** The named routes and the permission behind each portal. */
export const PORTALS: Record<Portal, PortalRoutes> = {
  admin: {
    login: 'admin.login',
    forgot: 'admin.forgot',
    home: 'admin.overview',
    permission: PERMISSIONS.ADMIN_ACCESS,
  },
  garage: {
    login: 'garage.login',
    forgot: 'garage.forgot',
    home: 'garage.dashboard',
    permission: PERMISSIONS.GARAGE_ACCESS,
  },
}

/**
 * The portal on screen: its colours and where "home" and "sign in" go. Pages
 * that belong to neither (no access, not found) keep the last one.
 */
export const activePortal = ref<Portal>('admin')

/** Which portal `route` is part of, if any. */
export function portalOf(route: RouteLocationNormalized): Portal | null {
  const fromMeta = route.matched.find((record) => record.meta.portal)?.meta.portal
  if (fromMeta) return fromMeta
  // A mistyped /garage/... link ends on "not found", which sits outside both portals.
  for (const portal of ['garage', 'admin'] as const) {
    if (route.path === `/${portal}` || route.path.startsWith(`/${portal}/`)) return portal
  }
  return null
}
