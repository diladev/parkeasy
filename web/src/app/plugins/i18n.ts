import type { App } from 'vue'
import { watch } from 'vue'
import { createI18n } from 'vue-i18n'

import { setApiLanguage } from '@/shared/api/http'

import ckb from '../i18n/ckb.json'
import en from '../i18n/en.json'
import { applyDocumentLocale, detectLocale, saveLocale, type AppLocale } from '../i18n/locale'

export type MessageSchema = typeof en

declare module 'vue-i18n' {
  // Typed keys in t() everywhere in the app.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}

export const i18n = createI18n<[MessageSchema], AppLocale, false>({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, ckb },
})

export function setLocale(locale: AppLocale): void {
  i18n.global.locale.value = locale
}

export function currentLocale(): AppLocale {
  return i18n.global.locale.value
}

let isSyncing = false

export function installI18n(app: App): void {
  app.use(i18n)
  // The locale is global (one i18n instance), so the side effects are set up once.
  if (isSyncing) return
  isSyncing = true
  watch(
    i18n.global.locale,
    (locale) => {
      applyDocumentLocale(locale)
      // Server messages (validation, "wrong password") come back in this language.
      setApiLanguage(locale)
      saveLocale(locale)
    },
    { immediate: true },
  )
}
