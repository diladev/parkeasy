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
 * Kurdish (Sorani) month names as used in Iraq. Browsers often ship without
 * Kurdish date data (Chrome falls back to English), so they are built in here.
 */
const KURDISH_MONTHS = [
  'کانوونی دووەم',
  'شوبات',
  'ئازار',
  'نیسان',
  'ئایار',
  'حوزەیران',
  'تەممووز',
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
