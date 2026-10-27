import { describe, expect, it } from 'vitest'

import { levelLabel } from './level-label'

const t = (key: string, named?: Record<string, unknown>) =>
  named ? `${key}:${JSON.stringify(named)}` : key

describe('levelLabel', () => {
  it('names ground, basement and upper floors', () => {
    expect(levelLabel('G', t)).toBe('levels.ground')
    expect(levelLabel('B2', t)).toBe('levels.basement:{"number":2}')
    expect(levelLabel('F1', t)).toBe('levels.floor:{"number":1}')
  })

  it('keeps any other name as it is', () => {
    expect(levelLabel('Roof', t)).toBe('Roof')
  })
})
