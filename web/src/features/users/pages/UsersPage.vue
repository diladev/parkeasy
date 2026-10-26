<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { pageRange } from '@/shared/api/pagination'
import { debounce } from '@/shared/lib/debounce'
import { formatInteger } from '@/shared/lib/format'

import UserRoleFilter from '../components/UserRoleFilter.vue'
import UsersTable from '../components/UsersTable.vue'
import { useUsersExport } from '../composables/useUserActions'
import { useUserListParams } from '../composables/useUserListParams'
import { useUsers } from '../composables/useUsers'
import { MAX_SEARCH_LENGTH, toRouteQuery } from '../model/list-params'
import type { Role } from '../model/user.schemas'

const { t } = useI18n()
const { params, update } = useUserListParams()
const users = useUsers(params)
const exporter = useUsersExport()

const list = computed(() => users.data.value)
const rows = computed(() => list.value?.data ?? [])
const range = computed(() => (list.value ? pageRange(list.value.meta, rows.value.length) : null))

const role = computed({
  get: () => params.value.role,
  set: (value: Role | undefined) => void update({ role: value }),
})

// The box updates as you type; the URL (and the request) 300 ms after you stop.
const searchText = ref(params.value.q)
const pushSearch = debounce((text: string) => {
  const q = text.trim()
  if (q !== params.value.q) void update({ q }, { replace: true })
}, 300)
watch(searchText, (text) => pushSearch(text))
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

// A page that no longer exists (e.g. after a search narrowed the list).
watch(list, (value) => {
  if (value && value.data.length === 0 && value.meta.totalItems > 0 && params.value.page > 1) {
    void update({ page: value.meta.totalPages }, { replace: true })
  }
})

const loadError = computed(() => {
  const error = users.error.value
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
        :placeholder="t('users.searchPlaceholder')"
        :aria-label="t('users.searchLabel')"
        :maxlength="MAX_SEARCH_LENGTH"
        class="w-full lg:w-72"
      />
      <UserRoleFilter v-model:role="role" :counts="list?.counts" />
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-download"
        class="self-start lg:ms-auto"
        :loading="exporter.isPending.value"
        @click="exporter.mutate(params)"
      >
        {{ t('users.export') }}
      </UButton>
    </div>

    <UAlert
      v-if="loadError"
      role="alert"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('users.loadError')"
      :description="loadError"
      :actions="[
        {
          label: t('common.retry'),
          color: 'neutral',
          variant: 'outline',
          onClick: () => void users.refetch(),
        },
      ]"
    />

    <template v-else>
      <UsersTable :rows :loading="users.isFetching.value">
        <template #empty>
          <p v-if="users.isPending.value" class="py-10 text-center text-sm text-muted">
            {{ t('users.loading') }}
          </p>
          <div v-else class="flex flex-col items-center gap-2 py-10">
            <p class="font-medium text-highlighted">{{ t('users.empty.title') }}</p>
            <p class="text-sm text-muted">{{ t('users.empty.description') }}</p>
            <UButton
              v-if="params.q"
              color="neutral"
              variant="outline"
              size="sm"
              class="mt-2"
              @click="clearSearch"
            >
              {{ t('users.empty.clearSearch') }}
            </UButton>
          </div>
        </template>
      </UsersTable>

      <div
        v-if="list && range && list.meta.totalItems > 0"
        class="flex flex-col items-center justify-between gap-3 sm:flex-row"
      >
        <!-- Read out after each search or filter change. -->
        <p class="text-sm text-muted" aria-live="polite">
          {{
            t('users.showing', {
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
