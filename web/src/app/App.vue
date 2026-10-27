<script setup lang="ts">
import { ckb, en } from '@nuxt/ui/locale'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDocumentTitle } from './navigation/useDocumentTitle'
import { usePortalTheme } from './theme/usePortalTheme'

const { locale } = useI18n()

// Nuxt UI's own texts (close buttons, "show password", ...) and its direction.
const uiLocale = computed(() => (locale.value === 'ckb' ? ckb : en))

useDocumentTitle()
usePortalTheme()
</script>

<template>
  <UApp :locale="uiLocale">
    <RouterView />
  </UApp>
</template>
