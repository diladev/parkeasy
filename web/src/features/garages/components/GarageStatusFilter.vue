<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FilterChips from '@/shared/ui/FilterChips.vue'

import { GARAGE_STATUSES, type GarageCounts, type GarageStatus } from '../model/garage.schemas'

const { counts } = defineProps<{ counts: GarageCounts | undefined }>()
/** undefined = all statuses. */
const status = defineModel<GarageStatus | undefined>('status')

const { t } = useI18n()

const options = computed(() =>
  [undefined, ...GARAGE_STATUSES].map((value) => ({
    value,
    label: t(`garages.filters.${value ?? 'all'}`),
    count: counts?.[value ?? 'all'],
  })),
)
</script>

<template>
  <FilterChips v-model="status" :options :label="t('garages.filterLabel')" />
</template>
