<script setup lang="ts" generic="T">
import { useI18n } from 'vue-i18n'

import type { GaragePage } from '../composables/useGaragePage'

/**
 * Shows a portal page once its data is in, and otherwise the right message:
 * the garages failed to load, the owner has none yet, the page's own data
 * failed, or it is still loading.
 */
const { page, loadTitle, loadingLabel } = defineProps<{
  page: GaragePage<T>
  /** "Couldn't load the dashboard" */
  loadTitle: string
  /** For screen readers while the skeleton shows. */
  loadingLabel: string
}>()

defineSlots<{
  default(props: { data: T }): unknown
  loading(): unknown
}>()

const { t } = useI18n()
</script>

<template>
  <UAlert
    v-if="page.garagesError.value"
    role="alert"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :title="t('garagePortal.garagesLoadError')"
    :description="page.garagesError.value"
    :actions="[
      {
        label: t('common.retry'),
        color: 'neutral',
        variant: 'outline',
        onClick: () => void page.garages.refetch(),
      },
    ]"
  />

  <UEmpty
    v-else-if="page.hasNoGarages.value"
    icon="i-lucide-warehouse"
    :title="t('garagePortal.noGarages.title')"
    :description="t('garagePortal.noGarages.description')"
    class="rounded-[12px] border border-default bg-muted"
  />

  <UAlert
    v-else-if="page.loadError.value"
    role="alert"
    color="error"
    variant="subtle"
    icon="i-lucide-circle-alert"
    :title="loadTitle"
    :description="page.loadError.value"
    :actions="[
      {
        label: t('common.retry'),
        color: 'neutral',
        variant: 'outline',
        onClick: () => void page.query.refetch(),
      },
    ]"
  />

  <slot v-else-if="page.data.value !== undefined" :data="page.data.value as T" />

  <div v-else :aria-label="loadingLabel" role="status">
    <slot name="loading" />
  </div>
</template>
