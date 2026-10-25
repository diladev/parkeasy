import { describe, expect, it } from 'vitest'

import { parseEnv } from './env'

describe('parseEnv', () => {
  it('uses safe defaults', () => {
    expect(parseEnv({})).toEqual({ API_URL: '/api', APP_NAME: 'ParkEasy', IS_DEV: false })
  })

  it('accepts a path or an absolute URL and drops the trailing slash', () => {
    expect(parseEnv({ VITE_API_URL: '/api/' }).API_URL).toBe('/api')
    expect(parseEnv({ VITE_API_URL: 'https://api.parkeasy.app/' }).API_URL).toBe(
      'https://api.parkeasy.app',
    )
  })

  it('fails loudly on a broken value', () => {
    expect(() => parseEnv({ VITE_API_URL: 'api.parkeasy.app' })).toThrow(/Invalid environment/)
    expect(() => parseEnv({ VITE_APP_NAME: '' })).toThrow(/Invalid environment/)
  })
})
