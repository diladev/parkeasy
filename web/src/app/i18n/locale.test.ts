import { afterEach, describe, expect, it, vi } from 'vitest'

import ckb from './ckb.json'
import en from './en.json'
import { applyDocumentLocale, detectLocale, saveLocale } from './locale'

function keys(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keys(value as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

function placeholders(messages: object): Record<string, string[]> {
  const flat: Record<string, string[]> = {}
  const walk = (node: object, prefix: string) => {
    for (const [key, value] of Object.entries(node)) {
      if (typeof value === 'string') flat[prefix + key] = (value.match(/\{\w+\}/g) ?? []).sort()
      else if (typeof value === 'object' && value !== null)
        walk(value as object, `${prefix}${key}.`)
    }
  }
  walk(messages, '')
  return flat
}

describe('translations', () => {
  it('Kurdish has exactly the English keys', () => {
    expect(keys(ckb).sort()).toEqual(keys(en).sort())
  })

  it('both languages use the same {placeholders}', () => {
    expect(placeholders(ckb)).toEqual(placeholders(en))
  })

  it('has no empty strings', () => {
    const empty = (messages: object) =>
      keys(messages).filter(
        (key) =>
          key
            .split('.')
            .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], messages) ===
          '',
      )
    expect(empty(en)).toEqual([])
    expect(empty(ckb)).toEqual([])
  })
})

describe('locale', () => {
  afterEach(() => localStorage.clear())

  it('prefers the saved choice', () => {
    saveLocale('ckb')
    expect(detectLocale()).toBe('ckb')
  })

  it('falls back to the browser language', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ku-IQ', 'en'])
    expect(detectLocale()).toBe('ckb')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-DE'])
    expect(detectLocale()).toBe('en')
  })

  it('still works when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError')
    })
    expect(() => detectLocale()).not.toThrow()
    expect(() => saveLocale('en')).not.toThrow()
  })

  it('switches the document direction for Kurdish', () => {
    applyDocumentLocale('ckb')
    expect(document.documentElement).toHaveProperty('dir', 'rtl')
    expect(document.documentElement).toHaveProperty('lang', 'ckb')
    applyDocumentLocale('en')
    expect(document.documentElement).toHaveProperty('dir', 'ltr')
  })
})
