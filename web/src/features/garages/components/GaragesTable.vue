<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatInteger, formatOneDecimal } from '@/shared/lib/format'

import { LIST_ACTION, type GarageAction } from '../model/garage-actions'
import type { GarageRow } from '../model/garage.schemas'
import GarageStatusBadge from './GarageStatusBadge.vue'

const {
  rows,
  loading = false,
  busyId = null,
} = defineProps<{
  rows: GarageRow[]
  loading?: boolean
  /** The garage whose action is running; its button shows a spinner. */
  busyId?: number | null
}>()

const emit = defineEmits<{
  action: [garage: GarageRow, action: GarageAction]
}>()

defineSlots<{ empty?: () => unknown }>()

const { t } = useI18n()

const columns = computed<TableColumn<GarageRow>[]>(() => [
  { accessorKey: 'name', header: t('garages.columns.garage') },
  { id: 'owner', header: t('garages.columns.owner') },
  { accessorKey: 'city', header: t('garages.columns.city') },
  { accessorKey: 'total_slots', header: t('garages.columns.slots') },
  { accessorKey: 'rating', header: t('garages.columns.rating') },
  { accessorKey: 'revenue_30d', header: t('garages.columns.revenue') },
  { accessorKey: 'status', header: t('garages.columns.status') },
  { id: 'actions', header: t('garages.columns.actions') },
])

const ACTION_STYLE = {
  approve: { color: 'success', variant: 'solid' },
  view: { color: 'neutral', variant: 'outline' },
  restore: { color: 'neutral', variant: 'outline' },
} as const

const detailLink = (garage: GarageRow) => ({
  name: 'admin.garages.detail',
  params: { id: garage.id },
})

/** "View" is a link; the other buttons change the status here. */
function onRowAction(garage: GarageRow) {
  const action = LIST_ACTION[garage.status]
  if (action !== 'view') emit('action', garage, action)
}
</script>

<template>
  <UTable
    :data="rows"
    :columns
    :loading
    :caption="t('garages.title')"
    :get-row-id="(row: GarageRow) => String(row.id)"
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
          :to="detailLink(row.original)"
          class="font-medium text-highlighted hover:underline"
          :data-garage-name="row.original.name"
          >{{ row.original.name }}</ULink
        >
        <span class="text-xs text-dimmed">{{ row.original.address }}</span>
      </div>
    </template>

    <template #owner-cell="{ row }">
      <span v-if="row.original.owner" dir="auto">{{ row.original.owner.name }}</span>
      <template v-else>
        <span aria-hidden="true">—</span>
        <span class="sr-only">{{ t('garages.noOwner') }}</span>
      </template>
    </template>

    <template #rating-cell="{ row }">
      <template v-if="row.original.rating > 0">
        {{ formatOneDecimal(row.original.rating) }} <span aria-hidden="true">★</span>
      </template>
      <template v-else>
        <span aria-hidden="true">—</span>
        <span class="sr-only">{{ t('garages.notRated') }}</span>
      </template>
    </template>

    <template #revenue_30d-cell="{ row }">
      <span class="font-medium whitespace-nowrap text-highlighted">
        {{ formatInteger(row.original.revenue_30d) }} {{ t('common.iqd') }}
      </span>
    </template>

    <template #status-cell="{ row }">
      <GarageStatusBadge :status="row.original.status" />
    </template>

    <template #actions-cell="{ row }">
      <UButton
        size="xs"
        v-bind="ACTION_STYLE[LIST_ACTION[row.original.status]]"
        :to="LIST_ACTION[row.original.status] === 'view' ? detailLink(row.original) : undefined"
        :loading="busyId === row.original.id"
        :disabled="busyId !== null && busyId !== row.original.id"
        @click="onRowAction(row.original)"
      >
        {{ t(`garages.actions.${LIST_ACTION[row.original.status]}`) }}
        <span class="sr-only">{{ row.original.name }}</span>
      </UButton>
    </template>

    <template #empty>
      <slot name="empty" />
    </template>
  </UTable>
</template>
