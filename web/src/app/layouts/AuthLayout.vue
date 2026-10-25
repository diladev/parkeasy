<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LocaleSwitch from './parts/LocaleSwitch.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-default">
    <a href="#main" class="skip-link">{{ t('app.skipToContent') }}</a>
    <header class="flex justify-end p-4">
      <LocaleSwitch />
    </header>
    <main
      id="main"
      tabindex="-1"
      class="flex flex-1 items-center justify-center px-4 pb-16 outline-none"
    >
      <RouterView />
    </main>
  </div>
</template>
