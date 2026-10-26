<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { formatInteger, formatOneDecimal } from '@/shared/lib/format'
import { usePageTitle } from '@/shared/navigation/page-title'

import GarageFormModal from '../components/GarageFormModal.vue'
import GarageHeaderCard from '../components/GarageHeaderCard.vue'
import GarageSettingsCard from '../components/GarageSettingsCard.vue'
import GarageStatCard from '../components/GarageStatCard.vue'
import LevelOccupancyCard from '../components/LevelOccupancyCard.vue'
import RecentBookingsTable from '../components/RecentBookingsTable.vue'
import SuspendGarageDialog from '../components/SuspendGarageDialog.vue'
import { useGarage } from '../composables/useGarage'
import { useGarageStatusChange } from '../composables/useGarageStatusChange'
import { needsConfirmation, type GarageAction } from '../model/garage-actions'
import { percent, revenueChange } from '../model/garage-figures'

const { id } = defineProps<{ id: number }>()

const { t } = useI18n()
const query = useGarage(() => id)
const statusChange = useGarageStatusChange()

const garage = computed(() => query.data.value)
// The heading and the browser tab show the garage's name once it has loaded.
usePageTitle(() => garage.value?.name)

const isNotFound = computed(
  () => query.error.value instanceof ApiError && query.error.value.kind === 'not-found',
)
const loadError = computed(() => {
  const error = query.error.value
  if (!error || garage.value || isNotFound.value) return ''
  if (error instanceof ApiError && error.kind === 'network') return t('common.errors.network')
  return error instanceof ApiError && error.message ? error.message : t('common.errors.generic')
})

// ------------------------------------------------------------------ figures

const occupancy = computed(() =>
  garage.value ? percent(garage.value.slots.taken, garage.value.slots.total) : 0,
)

const revenueHint = computed(() => {
  if (!garage.value) return { text: '', tone: 'muted' as const }
  const { last_30_days: current, previous_30_days: previous } = garage.value.revenue
  const change = revenueChange(current, previous)
  if (change === null)
    return { text: t('garages.detail.stats.revenueNoHistory'), tone: 'muted' as const }
  if (change === 0) return { text: t('garages.detail.stats.revenueSame'), tone: 'muted' as const }
  return change > 0
    ? { text: t('garages.detail.stats.revenueUp', { percent: change }), tone: 'up' as const }
    : { text: t('garages.detail.stats.revenueDown', { percent: -change }), tone: 'down' as const }
})

// ------------------------------------------------------------------ actions

const isConfirmOpen = ref(false)
const isEditOpen = ref(false)

function onAction(action: GarageAction) {
  if (needsConfirmation(action)) {
    isConfirmOpen.value = true
    return
  }
  run(action)
}

function run(action: GarageAction) {
  if (!garage.value) return
  statusChange.mutate(
    { garage: garage.value, action },
    { onSettled: () => (isConfirmOpen.value = false) },
  )
}
</script>

<template>
  <div class="space-y-6">
    <UEmpty
      v-if="isNotFound"
      icon="i-lucide-search-x"
      :title="t('garages.detail.notFound.title')"
      :description="t('garages.detail.notFound.description')"
      :actions="[
        {
          label: t('garages.detail.notFound.back'),
          to: { name: 'admin.garages' },
          color: 'neutral',
          variant: 'outline',
        },
      ]"
      class="rounded-[12px] border border-default bg-muted"
    />

    <UAlert
      v-else-if="loadError"
      role="alert"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('garages.detail.loadError')"
      :description="loadError"
      :actions="[
        {
          label: t('common.retry'),
          color: 'neutral',
          variant: 'outline',
          onClick: () => void query.refetch(),
        },
      ]"
    />

    <template v-else-if="garage">
      <GarageHeaderCard
        :garage
        :busy="statusChange.isPending.value && !isConfirmOpen"
        @action="onAction"
        @edit="isEditOpen = true"
      />

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GarageStatCard
          :label="t('garages.detail.stats.slots')"
          :value="formatInteger(garage.slots.total)"
          :hint="garage.slots.levels.map((level) => level.level).join(' · ')"
        />
        <GarageStatCard
          :label="t('garages.detail.stats.occupancy')"
          :value="`${occupancy}%`"
          :hint="
            t('garages.detail.stats.occupancyHint', {
              taken: formatInteger(garage.slots.taken),
              total: formatInteger(garage.slots.total),
            })
          "
        />
        <GarageStatCard
          :label="t('garages.detail.stats.revenue')"
          :value="`${formatInteger(garage.revenue.last_30_days)} ${t('common.iqd')}`"
          :hint="revenueHint.text"
          :tone="revenueHint.tone"
        />
        <GarageStatCard
          :label="t('garages.detail.stats.rating')"
          :value="garage.rating > 0 ? `${formatOneDecimal(garage.rating)} ★` : '—'"
          :hint="garage.rating > 0 ? t('garages.detail.stats.ratingHint') : t('garages.notRated')"
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <GarageSettingsCard :garage />
        <LevelOccupancyCard :levels="garage.slots.levels" />
      </div>

      <RecentBookingsTable :bookings="garage.recent_bookings" />

      <SuspendGarageDialog
        v-model:open="isConfirmOpen"
        :garage-name="garage.name"
        :busy="statusChange.isPending.value"
        @confirm="run('suspend')"
      />
      <GarageFormModal v-model:open="isEditOpen" :garage />
    </template>

    <div v-else class="space-y-4" :aria-label="t('garages.detail.loading')" role="status">
      <USkeleton class="h-24 w-full rounded-[12px]" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="n in 4" :key="n" class="h-28 rounded-[12px]" />
      </div>
      <USkeleton class="h-64 w-full rounded-[12px]" />
    </div>
  </div>
</template>
