<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCurrentGarage } from '../store/current-garage.store'

/** In the sidebar: the garage on screen, and a menu to change it when there are several. */
const { t } = useI18n()
const { garages, current, select } = useCurrentGarage()

const items = computed(() =>
  (garages.data.value ?? []).map((garage) => ({ label: garage.name, value: garage.id })),
)
const selected = computed({
  get: () => current.value?.id,
  set: (id) => {
    if (id !== undefined) select(id)
  },
})
</script>

<template>
  <USelect
    v-if="items.length > 1"
    v-model="selected"
    :items
    :aria-label="t('garagePortal.switcher.label')"
    icon="i-lucide-warehouse"
    class="w-full"
  />
  <p v-else-if="current" class="flex min-w-0 items-center gap-2 px-1 text-sm text-highlighted">
    <UIcon name="i-lucide-warehouse" class="size-4 shrink-0 text-dimmed" aria-hidden="true" />
    <span dir="auto" class="truncate">{{ current.name }}</span>
  </p>
</template>
