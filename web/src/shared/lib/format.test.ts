import { describe, expect, it } from 'vitest'

import { formatDateTime, formatInteger, formatMonthYear, formatOneDecimal } from './format'

describe('format', () => {
  it('formats numbers with Western digits', () => {
    expect(formatInteger(4_212_000)).toBe('4,212,000')
    expect(formatOneDecimal(4.25)).toBe('4.3')
  })

  it('shows dates on Iraq time in either language, with Western digits', () => {
    const date = new Date('2026-10-26T09:43:00Z') // 12:43 in Iraq
    expect(formatDateTime(date, 'en')).toBe('26 Oct 2026, 12:43')
    expect(formatDateTime(date, 'ckb')).toBe('26 تشرینی یەکەم 2026، 12:43')
    expect(formatMonthYear(date, 'en')).toBe('Oct 2026')
    expect(formatMonthYear(date, 'ckb')).toBe('تشرینی یەکەم 2026')
  })

  it("uses the Iraq date, not the viewer's, around midnight", () => {
    // 22:30 UTC on the 31st is 01:30 on 1 Nov in Iraq.
    expect(formatDateTime(new Date('2026-10-31T22:30:00Z'), 'en')).toBe('1 Nov 2026, 01:30')
  })
})
