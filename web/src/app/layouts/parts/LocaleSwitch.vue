<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { AppLocale } from '../../i18n/locale'
import { setLocale } from '../../plugins/i18n'

const { t, locale } = useI18n()

/** One button that switches to the other language, labelled in that language. */
const other = computed<AppLocale>(() => (locale.value === 'ckb' ? 'en' : 'ckb'))
</script>

<template>
  <UButton
    color="neutral"
    variant="ghost"
    icon="i-lucide-languages"
    :lang="other"
    @click="setLocale(other)"
  >
    <span class="sr-only" :lang="locale">{{ t('locale.label') }}: </span>
    {{ t(`locale.${other}`) }}
  </UButton>
</template>
