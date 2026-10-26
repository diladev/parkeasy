<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatInteger, formatMonthYear } from '@/shared/lib/format'

import type { UserRow } from '../model/user.schemas'
import UserStatusBadge from './UserStatusBadge.vue'

const { rows, loading = false } = defineProps<{ rows: UserRow[]; loading?: boolean }>()

defineSlots<{ empty?: () => unknown }>()

const { t, locale } = useI18n()

const columns = computed<TableColumn<UserRow>[]>(() => [
  { accessorKey: 'name', header: t('users.columns.name') },
  { accessorKey: 'email', header: t('users.columns.email') },
  { accessorKey: 'phone', header: t('users.columns.phone') },
  { accessorKey: 'bookings', header: t('users.columns.bookings') },
  { accessorKey: 'wallet_balance', header: t('users.columns.wallet') },
  { accessorKey: 'created_at', header: t('users.columns.joined') },
  { accessorKey: 'status', header: t('users.columns.status') },
])
</script>

<template>
  <UTable
    :data="rows"
    :columns
    :loading
    :caption="t('users.title')"
    :get-row-id="(row: UserRow) => String(row.id)"
    class="rounded-[10px] border border-default bg-muted"
    :ui="{
      caption: 'sr-only',
      thead: 'bg-elevated',
      th: 'text-xs font-medium uppercase text-dimmed',
      td: 'text-sm text-muted',
    }"
  >
    <template #name-cell="{ row }">
      <div class="flex flex-col">
        <ULink
          :to="{ name: 'admin.users.detail', params: { id: row.original.id } }"
          class="font-medium text-highlighted hover:underline"
          :data-user-name="row.original.name"
          dir="auto"
          >{{ row.original.name }}</ULink
        >
        <span class="text-xs text-dimmed">{{ t(`users.roles.${row.original.role}`) }}</span>
      </div>
    </template>
    <template #email-cell="{ row }">
      <span dir="ltr">{{ row.original.email }}</span>
    </template>
    <template #phone-cell="{ row }">
      <span dir="ltr" class="whitespace-nowrap">{{ row.original.phone }}</span>
    </template>
    <template #bookings-cell="{ row }">
      {{ formatInteger(row.original.bookings) }}
    </template>
    <template #wallet_balance-cell="{ row }">
      <span class="whitespace-nowrap">
        {{ formatInteger(row.original.wallet_balance) }} {{ t('common.iqd') }}
      </span>
    </template>
    <template #created_at-cell="{ row }">
      <span class="whitespace-nowrap">{{ formatMonthYear(row.original.created_at, locale) }}</span>
    </template>
    <template #status-cell="{ row }">
      <UserStatusBadge :status="row.original.status" />
    </template>
    <template #empty>
      <slot name="empty" />
    </template>
  </UTable>
</template>
