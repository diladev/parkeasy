<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { UserStatusBadge } from '@/features/users'
import { formatDateTime, formatTime, iraqDaysAgo } from '@/shared/lib/format'

import type { Signup } from '../model/overview.schemas'

const { signups } = defineProps<{ signups: Signup[] }>()

const { t, locale } = useI18n()

const columns = computed<TableColumn<Signup>[]>(() => [
  { accessorKey: 'name', header: t('overview.signups.columns.name') },
  { accessorKey: 'email', header: t('overview.signups.columns.email') },
  { accessorKey: 'phone', header: t('overview.signups.columns.phone') },
  { accessorKey: 'created_at', header: t('overview.signups.columns.signedUp') },
  { accessorKey: 'status', header: t('overview.signups.columns.status') },
])

/** "Today · 10:12", "Yesterday · 20:31", then the full date. */
function signedUp(date: Date): string {
  const daysAgo = iraqDaysAgo(date)
  if (daysAgo === 0) return t('overview.signups.today', { time: formatTime(date) })
  if (daysAgo === 1) return t('overview.signups.yesterday', { time: formatTime(date) })
  return formatDateTime(date, locale.value)
}
</script>

<template>
  <section aria-labelledby="signups-title">
    <div class="mb-3 flex items-center justify-between">
      <h2 id="signups-title" class="text-sm font-medium text-highlighted">
        {{ t('overview.signups.title') }}
      </h2>
      <ULink :to="{ name: 'admin.users' }" class="text-sm text-primary hover:underline">
        {{ t('overview.signups.all') }}
      </ULink>
    </div>
    <UTable
      :data="signups"
      :columns
      :empty="t('overview.signups.empty')"
      class="rounded-[10px] border border-default bg-muted"
      :ui="{
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
      <template #created_at-cell="{ row }">
        <span class="whitespace-nowrap">{{ signedUp(row.original.created_at) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UserStatusBadge :status="row.original.status" />
      </template>
    </UTable>
  </section>
</template>
