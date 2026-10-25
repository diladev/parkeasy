<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="w-full max-w-md text-center" aria-labelledby="not-found-heading">
    <p class="text-5xl font-semibold text-dimmed" aria-hidden="true">404</p>
    <h1 id="not-found-heading" class="mt-4 text-xl font-medium text-highlighted">
      {{ t('errors.notFound.title') }}
    </h1>
    <p class="mt-2 text-sm text-muted">{{ t('errors.notFound.description') }}</p>
    <UButton class="mt-6" :to="{ name: 'admin.overview' }">{{ t('errors.notFound.home') }}</UButton>
  </section>
</template>
