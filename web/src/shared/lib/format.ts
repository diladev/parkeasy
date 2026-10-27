// Western digits in both languages, as in the mobile app and on Iraqi price tags.
const integer = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

/** 4212000 -> "4,212,000" */
export function formatInteger(value: number): string {
  return integer.format(value)
}

/** 4.25 -> "4.3" */
export function formatOneDecimal(value: number): string {
  return oneDecimal.format(value)
}

// ---------------------------------------------------------------- dates

const IRAQ = 'Asia/Baghdad'

/**
 * Kurdish (Sorani) month names as used in Iraq: the CLDR list, which Rudaw
 * also uses, except that December keeps the double و of January (CLDR writes
 * کانونی). Browsers often ship without Kurdish date data (Chrome falls back to
 * English), so they are built in here. The mobile app uses the same list.
 */
const KURDISH_MONTHS = [
  'کانوونی دووەم',
  'شوبات',
  'ئازار',
  'نیسان',
  'ئایار',
  'حوزەیران',
  'تەمووز',
  'ئاب',
  'ئەیلوول',
  'تشرینی یەکەم',
  'تشرینی دووەم',
  'کانوونی یەکەم',
] as const

/** Day, month (1-12), year, hours and minutes on Iraq time, where every lot is. */
function iraqParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IRAQ,
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return {
    day: get('day'),
    month: Number(get('month')),
    year: get('year'),
    time: `${get('hour')}:${get('minute')}`,
  }
}

/** "26 Oct 2026, 12:43" / "26 تشرینی یەکەم 2026، 12:43" (Western digits in both). */
export function formatDateTime(date: Date, language: string): string {
  if (language === 'ckb') {
    const { day, month, year, time } = iraqParts(date)
    return `${day} ${KURDISH_MONTHS[month - 1] ?? ''} ${year}، ${time}`
  }
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    hourCycle: 'h23',
    timeZone: IRAQ,
  }).format(date)
}

/** "Oct 2026" / "تشرینی یەکەم 2026" */
export function formatMonthYear(date: Date, language: string): string {
  if (language === 'ckb') {
    const { month, year } = iraqParts(date)
    return `${KURDISH_MONTHS[month - 1] ?? ''} ${year}`
  }
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: 'numeric',
    timeZone: IRAQ,
  }).format(date)
}

/** Sunday first, as Date.getDay() counts. Built in for the same reason as the months. */
const KURDISH_WEEKDAYS = [
  'یەکشەممە',
  'دووشەممە',
  'سێشەممە',
  'چوارشەممە',
  'پێنجشەممە',
  'هەینی',
  'شەممە',
] as const

/** "2026-10-27" (an Iraq calendar day, as the API sends it) -> "Tue" / "سێشەممە" */
export function formatWeekday(isoDate: string, language: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  // Noon UTC is the same calendar day everywhere, so the weekday can't slip.
  const date = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12))
  if (language === 'ckb') return KURDISH_WEEKDAYS[date.getUTCDay()] ?? ''
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' }).format(date)
}

/** "14:37", Iraq time. */
export function formatTime(date: Date): string {
  return iraqParts(date).time
}

/** 0 for today, 1 for yesterday... counted in Iraq calendar days. */
export function iraqDaysAgo(date: Date, now: Date = new Date()): number {
  const dayNumber = (value: Date) => {
    const { day, month, year } = iraqParts(value)
    return Date.UTC(Number(year), month - 1, Number(day)) / 86_400_000
  }
  return dayNumber(now) - dayNumber(date)
}
