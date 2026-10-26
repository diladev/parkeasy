<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatDateTime, formatInteger } from '@/shared/lib/format'

import type { GarageBooking } from '../model/garage.schemas'

const { bookings } = defineProps<{ bookings: GarageBooking[] }>()

const { t, locale } = useI18n()

const columns = computed<TableColumn<GarageBooking>[]>(() => [
  { accessorKey: 'id', header: t('garages.detail.bookings.columns.id') },
  { id: 'customer', header: t('garages.detail.bookings.columns.customer') },
  { id: 'vehicle', header: t('garages.detail.bookings.columns.vehicle') },
  { id: 'slot', header: t('garages.detail.bookings.columns.slot') },
  { accessorKey: 'start_time', header: t('garages.detail.bookings.columns.start') },
  { accessorKey: 'total_cost', header: t('garages.detail.bookings.columns.amount') },
  { accessorKey: 'status', header: t('garages.detail.bookings.columns.status') },
])

/** Text and colour per booking state; an early end shows as its own state. */
function statusOf(booking: GarageBooking) {
  if (booking.ended_early) return { key: 'endedEarly', color: 'neutral' } as const
  if (booking.status === 'active') return { key: 'active', color: 'success' } as const
  if (booking.status === 'cancelled') return { key: 'cancelled', color: 'error' } as const
  return { key: 'completed', color: 'neutral' } as const
}
</script>

<template>
  <section aria-labelledby="recent-bookings-title">
    <h2 id="recent-bookings-title" class="mb-3 text-sm font-medium text-highlighted">
      {{ t('garages.detail.bookings.title') }}
    </h2>
    <UTable
      :data="bookings"
      :columns
      :empty="t('garages.detail.bookings.empty')"
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
        <span v-if="row.original.customer" dir="auto" class="text-highlighted">{{
          row.original.customer.name
        }}</span>
        <span v-else>{{ t('garages.detail.bookings.deletedAccount') }}</span>
      </template>
      <template #vehicle-cell="{ row }">
        <!-- One text run: Vue drops the spaces between elements on separate lines. -->
        <template v-if="row.original.vehicle"
          >{{ `${row.original.vehicle.brand} ${row.original.vehicle.model} · `
          }}<span dir="ltr" class="whitespace-nowrap">{{
            row.original.vehicle.license_plate
          }}</span></template
        >
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
      <template #total_cost-cell="{ row }">
        <span class="font-medium whitespace-nowrap text-highlighted">
          {{ formatInteger(row.original.total_cost) }} {{ t('common.iqd') }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge
          :color="statusOf(row.original).color"
          variant="soft"
          :label="t(`garages.detail.bookings.status.${statusOf(row.original).key}`)"
          class="rounded-[7px]"
        />
      </template>
    </UTable>
  </section>
</template>
