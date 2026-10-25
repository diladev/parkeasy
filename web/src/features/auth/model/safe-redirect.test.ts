import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import { safeRedirect } from './safe-redirect'

const Empty = { render: () => null }

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/admin', name: 'admin.overview', component: Empty },
    { path: '/admin/garages', name: 'admin.garages', component: Empty },
    { path: '/admin/login', name: 'admin.login', component: Empty, meta: { guestOnly: true } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: Empty },
  ],
})

const FALLBACK = '/admin'

describe('safeRedirect', () => {
  it('keeps a known in-app path, with its query and hash', () => {
    expect(safeRedirect(router, '/admin/garages?page=2#top', FALLBACK)).toBe(
      '/admin/garages?page=2#top',
    )
  })

  it.each([
    ['protocol-relative', '//evil.com'],
    ['backslash trick', '/\\evil.com'],
    ['absolute URL', 'https://evil.com/admin'],
    ['javascript URL', 'javascript:alert(1)'],
    ['control characters', '/admin\n//evil.com'],
    ['relative path', 'admin/garages'],
    ['unknown route', '/does-not-exist'],
    ['the sign-in page', '/admin/login'],
    ['not a string', ['/admin/garages']],
    ['missing', undefined],
  ])('falls back for %s', (_label, raw) => {
    expect(safeRedirect(router, raw, FALLBACK)).toBe(FALLBACK)
  })
})
