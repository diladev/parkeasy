<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { formatInteger } from '@/shared/lib/format'
import StatCard from '@/shared/ui/StatCard.vue'

import RecentSignupsTable from '../components/RecentSignupsTable.vue'
import RevenueChart from '../components/RevenueChart.vue'
import TopGaragesCard from '../components/TopGaragesCard.vue'
import { useOverview } from '../composables/useOverview'
import { bookingsTrend, revenueTrend, userGrowth, type Trend } from '../model/overview-figures'

const { t } = useI18n()
const query = useOverview()
const overview = computed(() => query.data.value)

const loadError = computed(() => {
  const error = query.error.value
  if (!error || overview.value) return ''
  if (error instanceof ApiError && error.kind === 'network') return t('common.errors.network')
  return error instanceof ApiError && error.message ? error.message : t('common.errors.generic')
})

/** "Up 12% on yesterday" / "Down 3% on yesterday" / "Same as yesterday" / a fallback. */
function trendHint(trend: Trend, key: 'yesterday' | 'lastMonth', fallback: string) {
  if (!trend) return { hint: fallback, tone: 'muted' as const }
  if (trend.tone === 'muted')
    return { hint: t(`overview.stats.same.${key}`), tone: 'muted' as const }
  const direction = trend.tone === 'up' ? 'up' : 'down'
  return {
    hint: t(`overview.stats.${direction}.${key}`, { percent: Math.abs(trend.percent) }),
    tone: trend.tone,
  }
}

const cards = computed(() => {
  const data = overview.value
  if (!data) return []
  const growth = userGrowth(data.users)
  const bookings = trendHint(
    bookingsTrend(data.bookings_today),
    'yesterday',
    t('overview.stats.noneYesterday'),
  )
  const revenue = trendHint(
    revenueTrend(data.revenue_month),
    'lastMonth',
    t('overview.stats.noneLastMonth'),
  )
  return [
    {
      key: 'users',
      label: t('overview.stats.users'),
      value: formatInteger(data.users.total),
      ...(data.users.new_this_month === 0
        ? { hint: t('overview.stats.noNewUsers'), tone: 'muted' as const }
        : growth
          ? {
              hint: t('overview.stats.usersGrowth', { percent: growth.percent }),
              tone: 'up' as const,
            }
          : {
              hint: t('overview.stats.usersNew', {
                count: formatInteger(data.users.new_this_month),
              }),
              tone: 'muted' as const,
            }),
    },
    {
      key: 'garages',
      label: t('overview.stats.garages'),
      value: formatInteger(data.garages.total),
      hint:
        data.garages.pending > 0
          ? t('overview.stats.pending', { count: formatInteger(data.garages.pending) })
          : t('overview.stats.nonePending'),
      tone: 'muted' as const,
    },
    {
      key: 'bookings',
      label: t('overview.stats.bookingsToday'),
      value: formatInteger(data.bookings_today.today),
      ...bookings,
    },
    {
      key: 'revenue',
      label: t('overview.stats.revenueMonth'),
      value: `${formatInteger(data.revenue_month.to_date)} ${t('common.iqd')}`,
      ...revenue,
    },
  ]
})
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="loadError"
      role="alert"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('overview.loadError')"
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

    <template v-else-if="overview">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          v-for="card in cards"
          :key="card.key"
          :label="card.label"
          :value="card.value"
          :hint="card.hint"
          :tone="card.tone"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
        <RevenueChart :days="overview.revenue_days" />
        <TopGaragesCard :garages="overview.top_garages" />
      </div>

      <RecentSignupsTable :signups="overview.recent_signups" />
    </template>

    <div v-else class="space-y-4" :aria-label="t('overview.loading')" role="status">
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="n in 4" :key="n" class="h-28 rounded-[12px]" />
      </div>
      <USkeleton class="h-64 w-full rounded-[12px]" />
      <USkeleton class="h-48 w-full rounded-[12px]" />
    </div>
  </div>
</template>
