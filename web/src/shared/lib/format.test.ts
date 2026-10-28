import { describe, expect, it } from 'vitest'

import {
  formatDay,
  formatDayRange,
  formatDateTime,
  formatInteger,
  formatMonthYear,
  formatOneDecimal,
  formatTime,
  formatWeekday,
  iraqDaysAgo,
} from './format'

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

describe('weekdays, times and days ago', () => {
  it('names the weekday of an Iraq calendar day', () => {
    expect(formatWeekday('2026-10-27', 'en')).toBe('Tue')
    expect(formatWeekday('2026-10-27', 'ckb')).toBe('سێشەممە')
    expect(formatWeekday('2026-10-23', 'ckb')).toBe('هەینی')
  })

  it('tells the time and the day in Iraq, not in UTC', () => {
    // 22:30 UTC on the 26th is 01:30 on the 27th in Iraq.
    const lateNight = new Date('2026-10-26T22:30:00Z')
    expect(formatTime(lateNight)).toBe('01:30')
    expect(iraqDaysAgo(lateNight, new Date('2026-10-27T08:00:00Z'))).toBe(0)
    expect(iraqDaysAgo(new Date('2026-10-26T20:00:00Z'), new Date('2026-10-27T08:00:00Z'))).toBe(1)
  })
})

describe('calendar days', () => {
  it('formats a day the API sends, in both languages', () => {
    expect(formatDay('2027-03-20', 'en')).toBe('20 Mar 2027')
    expect(formatDay('2027-03-20', 'ckb')).toBe('20 ئازار 2027')
  })

  it('formats a range, or a single day', () => {
    expect(formatDayRange('2027-03-20', '2027-03-22', 'en')).toBe('20 Mar 2027 – 22 Mar 2027')
    expect(formatDayRange('2026-12-31', '2026-12-31', 'ckb')).toBe('31 کانوونی یەکەم 2026')
  })
})
