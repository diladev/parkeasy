<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import type { BookingRow } from '@/shared/api/booking-row'
import { formatDateTime, formatInteger } from '@/shared/lib/format'

/**
 * A garage's bookings: the latest few on its admin page and the owner's
 * dashboard, or a whole page of them on the Garage Portal's Bookings page.
 */
const {
  bookings,
  title = '',
  showDuration = false,
  loading = false,
  empty = '',
} = defineProps<{
  bookings: BookingRow[]
  /** A heading above the table; leave it out when the page heading says it. */
  title?: string
  showDuration?: boolean
  loading?: boolean
  /** The text when there are none; "No bookings yet." by default. */
  empty?: string
}>()

defineSlots<{
  /** Next to the title, e.g. a "View all" link. */
  actions?(): unknown
}>()

const { t, locale } = useI18n()
const headingId = useId()

const columns = computed<TableColumn<BookingRow>[]>(() => [
  { accessorKey: 'id', header: t('bookings.columns.id') },
  { id: 'customer', header: t('bookings.columns.customer') },
  { id: 'vehicle', header: t('bookings.columns.vehicle') },
  { id: 'slot', header: t('bookings.columns.slot') },
  { accessorKey: 'start_time', header: t('bookings.columns.start') },
  ...(showDuration
    ? [{ accessorKey: 'duration_hours', header: t('bookings.columns.duration') }]
    : []),
  { accessorKey: 'total_cost', header: t('bookings.columns.amount') },
  { accessorKey: 'status', header: t('bookings.columns.status') },
])

/** Text and colour per booking state; an early end shows as its own state. */
function statusOf(booking: BookingRow) {
  if (booking.ended_early) return { key: 'endedEarly', color: 'neutral' } as const
  if (booking.status === 'active') return { key: 'active', color: 'success' } as const
  if (booking.status === 'cancelled') return { key: 'cancelled', color: 'error' } as const
  return { key: 'completed', color: 'neutral' } as const
}
</script>

<template>
  <section :aria-labelledby="title ? headingId : undefined">
    <div v-if="title" class="mb-3 flex items-center justify-between gap-3">
      <h2 :id="headingId" class="text-sm font-medium text-highlighted">{{ title }}</h2>
      <slot name="actions" />
    </div>
    <UTable
      :data="bookings"
      :columns
      :loading
      :empty="empty || t('bookings.empty')"
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
      <template #customer-cell="{ row }">
        <span v-if="row.original.source === 'walk_in'" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-footprints" class="size-3.5 text-dimmed" aria-hidden="true" />
          {{ t('bookings.walkIn') }}
        </span>
        <span v-else-if="row.original.customer" dir="auto" class="text-highlighted">{{
          row.original.customer.name
        }}</span>
        <span v-else>{{ t('bookings.deletedAccount') }}</span>
      </template>
      <template #vehicle-cell="{ row }">
        <!-- One text run: Vue drops the spaces between elements on separate lines. -->
        <template v-if="row.original.vehicle"
          >{{ `${row.original.vehicle.brand} ${row.original.vehicle.model} · `
          }}<span dir="ltr" class="whitespace-nowrap">{{
            row.original.vehicle.license_plate
          }}</span></template
        >
        <span v-else-if="row.original.plate" dir="ltr" class="whitespace-nowrap">{{
          row.original.plate
        }}</span>
        <span v-else aria-hidden="true">—</span>
      </template>
      <template #slot-cell="{ row }">
        <span v-if="row.original.slot" dir="ltr" class="font-medium text-highlighted">
          {{ row.original.slot.level }} · {{ row.original.slot.slot_number }}
        </span>
      </template>
      <template #start_time-cell="{ row }">
        <span class="whitespace-nowrap">{{ formatDateTime(row.original.start_time, locale) }}</span>
      </template>
      <template #duration_hours-cell="{ row }">
        <span v-if="row.original.duration_hours > 0" class="whitespace-nowrap">{{
          t('bookings.hours', { hours: row.original.duration_hours })
        }}</span>
        <span v-else aria-hidden="true">—</span>
      </template>
      <template #total_cost-cell="{ row }">
        <!-- A walk-in still parked hasn't been charged yet: it pays at the exit. -->
        <span
          v-if="row.original.source === 'walk_in' && row.original.status === 'active'"
          class="whitespace-nowrap"
          >{{ t('bookings.paysAtExit') }}</span
        >
        <span v-else class="font-medium whitespace-nowrap text-highlighted">
          {{ formatInteger(row.original.total_cost) }} {{ t('common.iqd') }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge
          :color="statusOf(row.original).color"
          variant="soft"
          :label="t(`bookings.status.${statusOf(row.original).key}`)"
          class="rounded-[7px]"
        />
      </template>
    </UTable>
  </section>
</template>
