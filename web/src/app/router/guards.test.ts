import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createMemoryHistory, type Router } from 'vue-router'

import { useSessionStore } from '@/features/auth'
import { ADMIN, DRIVER_ME, OWNER } from '@/test/msw/handlers'

import { createAppRouter } from '.'
import { activePortal } from './portal'

async function visit(router: Router, path: string): Promise<string> {
  await router.push(path)
  return router.currentRoute.value.fullPath
}

describe('route guards', () => {
  let router: Router

  beforeEach(() => {
    setActivePinia(createPinia())
    router = createAppRouter(createMemoryHistory())
  })

  describe('signed out', () => {
    it('sends visitors of the admin panel to its sign-in page', async () => {
      expect(await visit(router, '/admin')).toBe('/admin/login')
      expect(await visit(router, '/')).toBe('/admin/login')
    })

    it('remembers a deeper page to come back to', async () => {
      expect(await visit(router, '/admin?tab=2')).toBe('/admin/login?redirect=/admin?tab=2')
    })

    it('shows public pages', async () => {
      expect(await visit(router, '/admin/login')).toBe('/admin/login')
      expect(router.currentRoute.value.name).toBe('admin.login')
      await visit(router, '/no/such/page')
      expect(router.currentRoute.value.name).toBe('not-found')
    })
  })

  describe('signed in as an admin', () => {
    beforeEach(() => {
      useSessionStore().me = ADMIN.me
    })

    it('opens the overview', async () => {
      await visit(router, '/admin')
      expect(router.currentRoute.value.name).toBe('admin.overview')
    })

    it('skips the sign-in page', async () => {
      expect(await visit(router, '/admin/login')).toBe('/admin')
    })

    it('ignores an outside redirect target', async () => {
      expect(await visit(router, '/admin/login?redirect=//evil.com')).toBe('/admin')
    })
  })

  describe('signed in without admin rights', () => {
    beforeEach(() => {
      useSessionStore().me = DRIVER_ME
    })

    it('shows "no access" instead of the panel', async () => {
      await visit(router, '/admin')
      expect(router.currentRoute.value.name).toBe('forbidden')
    })

    it('still lets them reach the sign-in page to switch accounts', async () => {
      await visit(router, '/admin/login')
      expect(router.currentRoute.value.name).toBe('admin.login')
    })
  })

  describe('Garage Portal', () => {
    it('sends signed-out visitors to its own sign-in page', async () => {
      expect(await visit(router, '/garage')).toBe('/garage/login')
      expect(activePortal.value).toBe('garage')
      expect(await visit(router, '/garage/forgot-password')).toBe('/garage/forgot-password')
    })

    it('opens the dashboard for an owner and skips their sign-in page', async () => {
      useSessionStore().me = OWNER.me
      await visit(router, '/garage')
      expect(router.currentRoute.value.name).toBe('garage.dashboard')
      expect(await visit(router, '/garage/login')).toBe('/garage')
    })

    it('keeps owners out of the Admin Panel and admins out of the portal', async () => {
      useSessionStore().me = OWNER.me
      await visit(router, '/admin/users')
      expect(router.currentRoute.value.name).toBe('forbidden')
      // "Sign in with another account" then opens the Admin Panel's sign-in page.
      expect(activePortal.value).toBe('admin')

      useSessionStore().me = ADMIN.me
      await visit(router, '/garage')
      expect(router.currentRoute.value.name).toBe('forbidden')
      expect(activePortal.value).toBe('garage')
    })

    it('keeps the portal of a mistyped link on "not found"', async () => {
      await visit(router, '/garage/no-such-page')
      expect(router.currentRoute.value.name).toBe('not-found')
      expect(activePortal.value).toBe('garage')
    })
  })
})
