import { afterAll, afterEach, beforeAll } from 'vitest'

import { tokenStore } from '@/shared/auth/token-store'

import { garagesDb } from './msw/garages'
import { server } from './msw/server'

// jsdom has no layout; the router's scrollBehavior calls this.
window.scrollTo = () => undefined

// Any request without a handler fails the test instead of hitting the network.
// (MSW 3 renamed MSW 2's `onUnhandledRequest` to `onUnhandledFrame`.)
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  server.resetHandlers()
  garagesDb.reset()
  tokenStore.clear()
})
afterAll(() => server.close())
