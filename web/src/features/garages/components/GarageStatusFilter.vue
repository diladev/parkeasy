<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatInteger } from '@/shared/lib/format'

import { GARAGE_STATUSES, type GarageCounts, type GarageStatus } from '../model/garage.schemas'

const { counts } = defineProps<{ counts: GarageCounts | undefined }>()
/** undefined = all statuses. */
const status = defineModel<GarageStatus | undefined>('status')

const { t } = useI18n()

const options = computed(() =>
  [undefined, ...GARAGE_STATUSES].map((value) => {
    const key = value ?? 'all'
    const count = counts?.[key]
    return {
      key,
      value,
      label:
        count === undefined
          ? t(`garages.filters.${key}`)
          : `${t(`garages.filters.${key}`)} · ${formatInteger(count)}`,
    }
  }),
)
</script>

<template>
  <div role="group" :aria-label="t('garages.filterLabel')" class="flex flex-wrap gap-2">
    <UButton
      v-for="option in options"
      :key="option.key"
      :color="status === option.value ? 'primary' : 'neutral'"
      :variant="status === option.value ? 'soft' : 'outline'"
      size="sm"
      class="rounded-full px-3.5"
      :aria-pressed="status === option.value"
      @click="status = option.value"
    >
      {{ option.label }}
    </UButton>
  </div>
</template>
