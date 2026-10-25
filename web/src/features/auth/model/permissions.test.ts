import { describe, expect, it } from 'vitest'

import { hasPermission } from './permissions'

const granted = (...permissions: string[]) => new Set(permissions)

describe('hasPermission', () => {
  it.each([
    [['admin.access'], 'admin.access', true],
    [['admin.access'], 'garage.access', false],
    [[], 'admin.access', false],
    [['users.*'], 'users.delete', true],
    [['users.*'], 'garages.delete', false],
    [['*'], 'anything.at.all', true],
  ])('granted %j, required %s → %s', (permissions, required, expected) => {
    expect(hasPermission(granted(...permissions), required)).toBe(expected)
  })

  it('allows when nothing is required', () => {
    expect(hasPermission(granted(), undefined)).toBe(true)
    expect(hasPermission(granted(), [])).toBe(true)
  })

  it('needs all by default and one with mode "any"', () => {
    const mine = granted('users.read')
    expect(hasPermission(mine, ['users.read', 'users.update'])).toBe(false)
    expect(hasPermission(mine, ['users.read', 'users.update'], 'any')).toBe(true)
  })
})
