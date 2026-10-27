<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { activePortal, PORTALS } from '../router/portal'

const { t } = useI18n()

/** Back to the start of the portal the visitor was in. */
const home = computed(() => ({
  to: { name: PORTALS[activePortal.value].home },
  label:
    activePortal.value === 'garage' ? t('errors.notFound.homeGarage') : t('errors.notFound.home'),
}))
</script>

<template>
  <section class="w-full max-w-md text-center" aria-labelledby="not-found-heading">
    <p class="text-5xl font-semibold text-dimmed" aria-hidden="true">404</p>
    <h1 id="not-found-heading" class="mt-4 text-xl font-medium text-highlighted">
      {{ t('errors.notFound.title') }}
    </h1>
    <p class="mt-2 text-sm text-muted">{{ t('errors.notFound.description') }}</p>
    <UButton class="mt-6" :to="home.to">{{ home.label }}</UButton>
  </section>
</template>
