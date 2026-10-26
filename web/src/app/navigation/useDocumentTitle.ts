import { watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { env } from '@/shared/config/env'
import { pageTitle } from '@/shared/navigation/page-title'

/** "Overview · ParkEasy", in the current language; a page's own title wins. */
export function useDocumentTitle(): void {
  const route = useRoute()
  const { t } = useI18n()
  watchEffect(() => {
    const key = route.meta.title
    const title = pageTitle.value ?? (key ? t(key) : null)
    document.title = title ? `${title} · ${env.APP_NAME}` : env.APP_NAME
  })
}
