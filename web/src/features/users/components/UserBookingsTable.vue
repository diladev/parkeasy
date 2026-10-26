<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatDateTime, formatInteger } from '@/shared/lib/format'

import type { UserBooking } from '../model/user.schemas'

const { bookings } = defineProps<{ bookings: UserBooking[] }>()

const { t, locale } = useI18n()

const columns = computed<TableColumn<UserBooking>[]>(() => [
  { accessorKey: 'id', header: t('users.detail.bookings.columns.id') },
  { id: 'garage', header: t('users.detail.bookings.columns.garage') },
  { id: 'slot', header: t('users.detail.bookings.columns.slot') },
  { accessorKey: 'start_time', header: t('users.detail.bookings.columns.start') },
  { accessorKey: 'duration_hours', header: t('users.detail.bookings.columns.duration') },
  { accessorKey: 'total_cost', header: t('users.detail.bookings.columns.amount') },
  { accessorKey: 'status', header: t('users.detail.bookings.columns.status') },
])

/** Text and colour per booking state; an early end shows as its own state. */
function statusOf(booking: UserBooking) {
  if (booking.ended_early) return { key: 'endedEarly', color: 'neutral' } as const
  if (booking.status === 'active') return { key: 'active', color: 'success' } as const
  if (booking.status === 'cancelled') return { key: 'cancelled', color: 'error' } as const
  return { key: 'completed', color: 'neutral' } as const
}
</script>

<template>
  <section aria-labelledby="user-bookings-title">
    <h2 id="user-bookings-title" class="mb-3 text-sm font-medium text-highlighted">
      {{ t('users.detail.bookings.title') }}
    </h2>
    <UTable
      :data="bookings"
      :columns
      :empty="t('users.detail.bookings.empty')"
      class="rounded-[10px] border border-default bg-muted"
      :ui="{
        thead: 'bg-elevated',
        th: 'text-xs font-medium uppercase text-dimmed',
        td: 'text-sm text-muted',
      }"
    >
      <template #id-cell="{ row }">
        <span dir="ltr">#{{ row.original.id }}</span>
      </template>
      <template #garage-cell="{ row }">
        <ULink
          v-if="row.original.garage"
          :to="{ name: 'admin.garages.detail', params: { id: row.original.garage.id } }"
          class="font-medium text-highlighted hover:underline"
          >{{ row.original.garage.name }}</ULink
        >
        <span v-else aria-hidden="true">—</span>
      </template>
      <template #slot-cell="{ row }">
        <span v-if="row.original.slot" dir="ltr" class="whitespace-nowrap">
          {{ row.original.slot.level }} · {{ row.original.slot.slot_number }}
        </span>
      </template>
      <template #start_time-cell="{ row }">
        <span class="whitespace-nowrap">{{ formatDateTime(row.original.start_time, locale) }}</span>
      </template>
      <template #duration_hours-cell="{ row }">
        {{ t('users.detail.bookings.hours', { hours: row.original.duration_hours }) }}
      </template>
      <template #total_cost-cell="{ row }">
        <span class="font-medium whitespace-nowrap text-highlighted">
          {{ formatInteger(row.original.total_cost) }} {{ t('common.iqd') }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge
          :color="statusOf(row.original).color"
          variant="soft"
          :label="t(`users.detail.bookings.status.${statusOf(row.original).key}`)"
          class="rounded-[7px]"
        />
      </template>
    </UTable>
  </section>
</template>
