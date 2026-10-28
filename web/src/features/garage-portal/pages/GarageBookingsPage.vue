<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { BOOKING_SOURCES, BOOKING_STATUSES } from '@/shared/api/booking-row'
import { pageRange } from '@/shared/api/pagination'
import { debounce } from '@/shared/lib/debounce'
import { formatInteger } from '@/shared/lib/format'
import BookingsTable from '@/shared/ui/BookingsTable.vue'
import FilterChips from '@/shared/ui/FilterChips.vue'

import GaragePageFrame from '../components/GaragePageFrame.vue'
import { useBookingParams, useGarageBookings } from '../composables/useGarageBookings'
import { useGaragePage } from '../composables/useGaragePage'
import {
  BOOKING_PERIODS,
  MAX_SEARCH_LENGTH,
  toBookingQuery,
  type BookingPeriod,
  type BookingSourceFilter,
  type BookingStatusFilter,
} from '../model/bookings-params'

const { t } = useI18n()
const { params, update } = useBookingParams()
const page = useGaragePage((garageId) => useGarageBookings(garageId, params))

// ---------------------------------------------------------------- filters

const statusOptions = computed(() =>
  [undefined, ...BOOKING_STATUSES].map((value) => ({
    value,
    label: t(`garagePortal.bookings.status.${value ?? 'all'}`),
  })),
)
const status = computed({
  get: () => params.value.status,
  set: (value: BookingStatusFilter | undefined) => void update({ status: value }),
})

const ALL = 'all'
const sourceItems = computed(() =>
  [ALL, ...BOOKING_SOURCES].map((value) => ({
    value,
    label: t(`garagePortal.bookings.source.${value}`),
  })),
)
const source = computed({
  get: () => params.value.source ?? ALL,
  set: (value: string) =>
    void update({ source: value === ALL ? undefined : (value as BookingSourceFilter) }),
})

const periodItems = computed(() =>
  BOOKING_PERIODS.map((value) => ({ value, label: t(`garagePortal.bookings.period.${value}`) })),
)
const period = computed({
  get: () => params.value.period,
  set: (value: BookingPeriod) => void update({ period: value }),
})

// The box updates as you type; the URL (and the request) 300 ms after you stop.
const searchText = ref(params.value.q)
const pushSearch = debounce((text: string) => {
  const q = text.trim()
  if (q !== params.value.q) void update({ q }, { replace: true })
}, 300)
watch(searchText, (text) => pushSearch(text))
// Back/Forward or a shared link: show what the URL says.
watch(
  () => params.value.q,
  (q) => {
    if (q !== searchText.value.trim()) searchText.value = q
  },
)
onScopeDispose(pushSearch.cancel)

const isFiltered = computed(
  () =>
    params.value.q !== '' ||
    params.value.status !== undefined ||
    params.value.source !== undefined ||
    params.value.period !== 'all',
)
function clearFilters() {
  pushSearch.cancel()
  searchText.value = ''
  void update({ q: '', status: undefined, source: undefined, period: 'all' })
}

// A page that no longer exists (e.g. after a filter left fewer results).
watch(page.data, (value) => {
  if (value && value.data.length === 0 && value.meta.totalItems > 0 && params.value.page > 1) {
    void update({ page: Math.max(1, value.meta.totalPages) }, { replace: true })
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-center">
      <UInput
        v-model="searchText"
        type="search"
        icon="i-lucide-search"
        :placeholder="t('garagePortal.bookings.searchPlaceholder')"
        :aria-label="t('garagePortal.bookings.searchLabel')"
        :maxlength="MAX_SEARCH_LENGTH"
        class="w-full xl:w-72"
      />
      <FilterChips
        v-model="status"
        :options="statusOptions"
        :label="t('garagePortal.bookings.statusLabel')"
      />
      <div class="grid grid-cols-2 gap-2 xl:ms-auto xl:flex">
        <USelect
          v-model="source"
          :items="sourceItems"
          :aria-label="t('garagePortal.bookings.source.label')"
          icon="i-lucide-footprints"
          class="w-full min-w-0 xl:w-48"
        />
        <USelect
          v-model="period"
          :items="periodItems"
          :aria-label="t('garagePortal.bookings.period.label')"
          icon="i-lucide-calendar"
          class="w-full min-w-0 xl:w-44"
        />
      </div>
    </div>

    <GaragePageFrame
      :page
      :load-title="t('garagePortal.bookings.loadError')"
      :loading-label="t('garagePortal.bookings.loading')"
    >
      <template #default="{ data }">
        <BookingsTable
          :bookings="data.data"
          show-duration
          :loading="page.query.isFetching.value"
          :empty="isFiltered ? t('garagePortal.bookings.noMatch') : ''"
        />

        <div v-if="isFiltered && data.meta.totalItems === 0" class="flex justify-center">
          <UButton color="neutral" variant="outline" size="sm" @click="clearFilters">
            {{ t('garagePortal.bookings.clearFilters') }}
          </UButton>
        </div>

        <div
          v-if="data.meta.totalItems > 0"
          class="flex flex-col items-center justify-between gap-3 sm:flex-row"
        >
          <!-- Read out after each search or filter change. -->
          <p class="text-sm text-muted" aria-live="polite">
            {{
              t('garagePortal.bookings.showing', {
                from: formatInteger(pageRange(data.meta, data.data.length).from),
                to: formatInteger(pageRange(data.meta, data.data.length).to),
                total: formatInteger(data.meta.totalItems),
              })
            }}
          </p>
          <UPagination
            v-if="data.meta.totalPages > 1"
            :page="params.page"
            :total="data.meta.totalItems"
            :items-per-page="data.meta.itemsPerPage"
            :to="(n: number) => ({ query: toBookingQuery({ ...params, page: n }) })"
          />
        </div>
      </template>

      <template #loading>
        <USkeleton class="h-96 w-full rounded-[10px]" />
      </template>
    </GaragePageFrame>
  </div>
</template>
