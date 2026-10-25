import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { env } from '@/shared/config/env'

/** "Overview · ParkEasy", in the current language. */
export function useDocumentTitle(): void {
  const route = useRoute()
  const { t } = useI18n()
  watchEffect(() => {
    const key = route.meta.title
    document.title = key ? `${t(key)} · ${env.APP_NAME}` : env.APP_NAME
  })
}
