import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'

import { notifyLoggedOut } from '@/shared/auth/auth-channel'
import { tokenStore } from '@/shared/auth/token-store'

import { authApi } from '../api/auth.api'
import type { MeResponse } from '../model/auth.schemas'
import type { Portal } from '../model/permissions'

/**
 * Who is signed in, as told by GET /me. Holds no token (that is in
 * shared/auth/token-store) and is never persisted.
 */
export const useSessionStore = defineStore('session', () => {
  const me = shallowRef<MeResponse | null>(null)

  const isAuthenticated = computed(() => me.value !== null)
  const user = computed(() => me.value?.user ?? null)
  const role = computed(() => me.value?.role ?? null)
  const permissions = computed<ReadonlySet<string>>(() => new Set(me.value?.permissions ?? []))

  /** Forgets the session in this tab only. */
  function reset(): void {
    tokenStore.clear()
    me.value = null
  }

  /** Re-reads the role and permissions, e.g. after the server answered 403. */
  async function refreshMe(): Promise<void> {
    me.value = await authApi.me()
  }

  /**
   * On page load the in-memory access token is gone; the refresh cookie may
   * still bring the session back. Resolves false when nobody is signed in.
   */
  async function restore(): Promise<boolean> {
    try {
      await authApi.refresh()
      await refreshMe()
      return true
    } catch {
      // No cookie, an expired one, or the API is down: start signed out.
      reset()
      return false
    }
  }

  async function login(credentials: { email: string; password: string }, portal: Portal) {
    const session = await authApi.login(credentials, portal)
    tokenStore.set(session.accessToken)
    try {
      await refreshMe()
    } catch (error) {
      reset()
      throw error
    }
  }

  /** Ends the session on the server, then in every open tab. */
  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Already expired or the network is down: still sign out here. The
      // refresh token then simply expires on its own.
    } finally {
      reset()
      notifyLoggedOut('signed-out')
    }
  }

  return { me, isAuthenticated, user, role, permissions, reset, refreshMe, restore, login, logout }
})
