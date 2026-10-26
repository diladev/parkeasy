<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { pageRange } from '@/shared/api/pagination'
import { debounce } from '@/shared/lib/debounce'
import { formatInteger } from '@/shared/lib/format'

import GarageStatusFilter from '../components/GarageStatusFilter.vue'
import GaragesTable from '../components/GaragesTable.vue'
import { useGarageListParams } from '../composables/useGarageListParams'
import { useGarages } from '../composables/useGarages'
import { useGarageStatusChange } from '../composables/useGarageStatusChange'
import type { GarageAction } from '../model/garage-actions'
import type { GarageRow, GarageStatus } from '../model/garage.schemas'
import { MAX_SEARCH_LENGTH, toRouteQuery } from '../model/list-params'

const { t } = useI18n()
const { params, update } = useGarageListParams()
const garages = useGarages(params)
const statusChange = useGarageStatusChange()

const list = computed(() => garages.data.value)
const rows = computed(() => list.value?.data ?? [])
const range = computed(() => (list.value ? pageRange(list.value.meta, rows.value.length) : null))

// ---------------------------------------------------------------- filters

const status = computed({
  get: () => params.value.status,
  set: (value: GarageStatus | undefined) => void update({ status: value }),
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

function clearSearch() {
  pushSearch.cancel()
  searchText.value = ''
  void update({ q: '' })
}

// A page that no longer exists (e.g. the last garage on it was filtered out).
watch(list, (value) => {
  if (value && value.data.length === 0 && value.meta.totalItems > 0 && params.value.page > 1) {
    void update({ page: value.meta.totalPages }, { replace: true })
  }
})

// ---------------------------------------------------------------- actions

const busyId = computed(() =>
  statusChange.isPending.value ? (statusChange.variables.value?.garage.id ?? null) : null,
)
// Approve and restore happen right in the list; suspending is on the garage page.
function onAction(garage: GarageRow, action: GarageAction) {
  statusChange.mutate({ garage, action })
}

const loadError = computed(() => {
  const error = garages.error.value
  if (!error || list.value) return ''
  if (error instanceof ApiError && error.kind === 'network') return t('common.errors.network')
  return error instanceof ApiError && error.message ? error.message : t('common.errors.generic')
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
      <UInput
        v-model="searchText"
        type="search"
        icon="i-lucide-search"
        :placeholder="t('garages.searchPlaceholder')"
        :aria-label="t('garages.searchLabel')"
        :maxlength="MAX_SEARCH_LENGTH"
        class="w-full lg:w-72"
      />
      <GarageStatusFilter v-model:status="status" :counts="list?.counts" />
    </div>

    <UAlert
      v-if="loadError"
      role="alert"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('garages.loadError')"
      :description="loadError"
      :actions="[
        {
          label: t('common.retry'),
          color: 'neutral',
          variant: 'outline',
          onClick: () => void garages.refetch(),
        },
      ]"
    />

    <template v-else>
      <GaragesTable :rows :loading="garages.isFetching.value" :busy-id="busyId" @action="onAction">
        <template #empty>
          <p v-if="garages.isPending.value" class="py-10 text-center text-sm text-muted">
            {{ t('garages.loading') }}
          </p>
          <div v-else class="flex flex-col items-center gap-2 py-10">
            <p class="font-medium text-highlighted">{{ t('garages.empty.title') }}</p>
            <p class="text-sm text-muted">{{ t('garages.empty.description') }}</p>
            <UButton
              v-if="params.q"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-2"
              @click="clearSearch"
            >
              {{ t('garages.empty.clearSearch') }}
            </UButton>
          </div>
        </template>
      </GaragesTable>

      <div
        v-if="list && range && list.meta.totalItems > 0"
        class="flex flex-col items-center justify-between gap-3 sm:flex-row"
      >
        <!-- Read out after each search or filter change. -->
        <p class="text-sm text-muted" aria-live="polite">
          {{
            t('garages.showing', {
              from: formatInteger(range.from),
              to: formatInteger(range.to),
              total: formatInteger(list.meta.totalItems),
            })
          }}
        </p>
        <UPagination
          v-if="list.meta.totalPages > 1"
          :page="params.page"
          :total="list.meta.totalItems"
          :items-per-page="list.meta.itemsPerPage"
          :to="(page: number) => ({ query: toRouteQuery({ ...params, page }) })"
        />
      </div>
    </template>
  </div>
</template>
