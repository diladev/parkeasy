export const LOCALES = ['en', 'ckb'] as const
export type AppLocale = (typeof LOCALES)[number]

/** Kurdish (Sorani) is written right to left. */
export const LOCALE_DIRECTION: Readonly<Record<AppLocale, 'ltr' | 'rtl'>> = {
  en: 'ltr',
  ckb: 'rtl',
}

const STORAGE_KEY = 'parkeasy.locale'

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** The saved choice, else the browser language ("ckb", "ku" or "ku-IQ" → Kurdish), else English. */
export function detectLocale(): AppLocale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isAppLocale(saved)) return saved
  } catch {
    // Storage can be blocked (private mode, site settings). Not worth an error.
  }
  const languages = typeof navigator === 'undefined' ? [] : navigator.languages
  return languages.some((lang) => /^(ckb|ku)\b/i.test(lang)) ? 'ckb' : 'en'
}

/** Remembers the choice in this browser. Only a preference, nothing sensitive. */
export function saveLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // See detectLocale().
  }
}

/** Sets <html lang dir> so the browser, screen readers and CSS logical properties follow. */
export function applyDocumentLocale(locale: AppLocale): void {
  document.documentElement.lang = locale
  document.documentElement.dir = LOCALE_DIRECTION[locale]
}
