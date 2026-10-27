<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { formatInteger } from '@/shared/lib/format'
import { percent } from '@/shared/lib/levels'
import BookingsTable from '@/shared/ui/BookingsTable.vue'
import LevelOccupancyCard from '@/shared/ui/LevelOccupancyCard.vue'
import RevenueChart from '@/shared/ui/RevenueChart.vue'
import StatCard from '@/shared/ui/StatCard.vue'

import GaragePageFrame from '../components/GaragePageFrame.vue'
import GarageStatusNote from '../components/GarageStatusNote.vue'
import { useDashboard } from '../composables/useDashboard'
import { useGaragePage } from '../composables/useGaragePage'
import { compare, splitMinutes, type Comparison } from '../model/dashboard-figures'
import type { GarageDashboard } from '../model/portal.schemas'

const { t } = useI18n()
const page = useGaragePage(useDashboard)

/** Hint text and colour for a "this period against the last one" line. */
function trend(
  comparison: Comparison,
  keys: { up: string; down: string; same: string; none: string },
) {
  if (comparison.kind === 'none') return { hint: t(keys.none), tone: 'muted' as const }
  if (comparison.kind === 'same') return { hint: t(keys.same), tone: 'muted' as const }
  return {
    hint: t(comparison.kind === 'up' ? keys.up : keys.down, { percent: comparison.percent }),
    tone: comparison.kind,
  }
}

function duration(minutes: number): string {
  const parts = splitMinutes(minutes)
  if (parts.hours === 0) return t('garagePortal.duration.minutes', parts)
  if (parts.minutes === 0) return t('garagePortal.duration.hours', parts)
  return t('garagePortal.duration.hoursMinutes', parts)
}

function cards(data: GarageDashboard) {
  const stats = 'garagePortal.dashboard.stats'
  const revenue = trend(compare(data.revenue_today.today, data.revenue_today.yesterday), {
    up: `${stats}.up`,
    down: `${stats}.down`,
    same: `${stats}.same`,
    none: `${stats}.noneYesterday`,
  })
  const stay = data.average_stay
  // A longer or shorter stay is neither good nor bad news: no green or red.
  const stayHint =
    stay.last_7_days === null
      ? t(`${stats}.noStays`)
      : trend(compare(stay.last_7_days, stay.previous_7_days), {
          up: `${stats}.stayUp`,
          down: `${stats}.stayDown`,
          same: `${stats}.staySame`,
          none: `${stats}.noStaysLastWeek`,
        }).hint

  return [
    {
      key: 'occupancy',
      label: t(`${stats}.occupancy`),
      value: `${percent(data.occupancy.taken, data.occupancy.total)}%`,
      hint: t(`${stats}.occupancyHint`, {
        taken: formatInteger(data.occupancy.taken),
        total: formatInteger(data.occupancy.total),
      }),
      tone: 'muted' as const,
    },
    {
      key: 'revenue',
      label: t(`${stats}.revenueToday`),
      value: `${formatInteger(data.revenue_today.today)} ${t('common.iqd')}`,
      ...revenue,
    },
    {
      key: 'active',
      label: t(`${stats}.activeBookings`),
      value: formatInteger(data.active_bookings.active),
      hint: t(`${stats}.endingSoon`, data.active_bookings.ending_soon),
      tone: 'muted' as const,
    },
    {
      key: 'stay',
      label: t(`${stats}.averageStay`),
      value: stay.last_7_days === null ? '—' : duration(stay.last_7_days),
      hint: stayHint,
      tone: 'muted' as const,
    },
  ]
}
</script>

<template>
  <div class="space-y-6">
    <GaragePageFrame
      :page
      :load-title="t('garagePortal.dashboard.loadError')"
      :loading-label="t('garagePortal.dashboard.loading')"
    >
      <template #default="{ data }">
        <GarageStatusNote :garage="data.garage" />

        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            v-for="card in cards(data)"
            :key="card.key"
            :label="card.label"
            :value="card.value"
            :hint="card.hint"
            :tone="card.tone"
          />
        </div>

        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <RevenueChart
            :days="data.revenue_days"
            :title="t('garagePortal.dashboard.revenueChart')"
          />
          <LevelOccupancyCard :levels="data.levels" />
        </div>

        <BookingsTable
          :bookings="data.recent_bookings"
          :title="t('garagePortal.dashboard.recentBookings')"
        />
      </template>

      <template #loading>
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <USkeleton v-for="n in 4" :key="n" class="h-28 rounded-[12px]" />
          </div>
          <USkeleton class="h-64 w-full rounded-[12px]" />
          <USkeleton class="h-48 w-full rounded-[12px]" />
        </div>
      </template>
    </GaragePageFrame>
  </div>
</template>
