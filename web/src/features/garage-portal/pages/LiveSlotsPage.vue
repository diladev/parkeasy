<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { formatTime } from '@/shared/lib/format'
import { levelLabel } from '@/shared/lib/level-label'
import { firstQueryValue } from '@/shared/navigation/route-query'

import GaragePageFrame from '../components/GaragePageFrame.vue'
import GarageStatusNote from '../components/GarageStatusNote.vue'
import SlotDetails from '../components/SlotDetails.vue'
import SlotGrid from '../components/SlotGrid.vue'
import { useGaragePage } from '../composables/useGaragePage'
import { useLiveSlots, useSlotChange, type SlotChange } from '../composables/useLiveSlots'
import { SLOT_STATUSES, type LiveSlot, type LiveSlots } from '../model/portal.schemas'
import { countByStatus, SLOT_TONE } from '../model/slots'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const page = useGaragePage(useLiveSlots)
const slotChange = useSlotChange(() => page.current.value?.id ?? null)

// The level tab and the selected slot live in the URL (?level=B1&slot=12), so
// a reload or a shared link opens the same view.
function levelOf(data: LiveSlots): string {
  const asked = firstQueryValue(route.query.level)
  return asked && data.levels.includes(asked) ? asked : (data.levels[0] ?? '')
}
function selectedOf(data: LiveSlots, level: string): LiveSlot | null {
  const id = Number(firstQueryValue(route.query.slot))
  return data.slots.find((slot) => slot.id === id && slot.level === level) ?? null
}
const slotsOn = (data: LiveSlots, level: string) =>
  data.slots.filter((slot) => slot.level === level)

function levelTabs(data: LiveSlots) {
  return data.levels.map((level) => ({
    value: level,
    label: t('garagePortal.slots.levelTab', {
      level: levelLabel(level, t),
      count: countByStatus(slotsOn(data, level)).free,
    }),
  }))
}

function showLevel(level: string | number) {
  void router.replace({ query: { ...route.query, level: String(level), slot: undefined } })
}

async function select(slot: LiveSlot) {
  await router.replace({ query: { ...route.query, level: slot.level, slot: String(slot.id) } })
  // Below the grid on narrow screens: bring the details into view.
  if (!window.matchMedia?.('(min-width: 1024px)').matches) {
    await nextTick()
    document.querySelector('[data-slot-details]')?.scrollIntoView?.({ block: 'nearest' })
  }
}

function run(change: SlotChange, done: () => void) {
  slotChange.mutate(change, { onSuccess: done })
}

const updatedAt = computed(() => formatTime(new Date(page.query.dataUpdatedAt.value)))

// On a phone the level tabs scroll sideways: keep the chosen one in view.
watch(
  () => [route.query.level, page.data.value !== undefined],
  async () => {
    await nextTick()
    document
      .querySelector('[role="tab"][aria-selected="true"]')
      ?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6">
    <GaragePageFrame
      :page
      :load-title="t('garagePortal.slots.loadError')"
      :loading-label="t('garagePortal.slots.loading')"
    >
      <template #default="{ data }">
        <GarageStatusNote :garage="data.garage" />

        <UEmpty
          v-if="data.slots.length === 0"
          icon="i-lucide-layout-grid"
          :title="t('garagePortal.slots.empty')"
          class="rounded-[12px] border border-default bg-muted"
        />

        <template v-else>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <UTabs
              :model-value="levelOf(data)"
              :items="levelTabs(data)"
              :content="false"
              variant="pill"
              :aria-label="t('garagePortal.slots.levels')"
              :ui="{
                root: 'min-w-0 max-w-full',
                list: 'max-w-full overflow-x-auto',
                trigger: 'flex-none',
                label: 'overflow-visible',
              }"
              @update:model-value="showLevel"
            />
            <p class="flex items-center gap-2 text-xs text-muted">
              <span class="size-2 animate-pulse rounded-full bg-success" aria-hidden="true" />
              {{ t('garagePortal.slots.updated', { time: updatedAt }) }}
            </p>
          </div>

          <ul :aria-label="t('garagePortal.slots.legend')" class="flex flex-wrap gap-x-5 gap-y-2">
            <li
              v-for="status in SLOT_STATUSES"
              :key="status"
              class="flex items-center gap-2 text-sm text-muted"
            >
              <span
                class="size-2.5 rounded-full"
                :class="SLOT_TONE[status].dot"
                aria-hidden="true"
              />
              {{ t(`garagePortal.slots.status.${status}`) }}
              <span class="font-medium text-highlighted">{{
                countByStatus(slotsOn(data, levelOf(data)))[status]
              }}</span>
            </li>
          </ul>

          <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_320px]">
            <SlotGrid
              :slots="slotsOn(data, levelOf(data))"
              :selected-id="selectedOf(data, levelOf(data))?.id ?? null"
              :label="t('garagePortal.slots.grid', { level: levelLabel(levelOf(data), t) })"
              class="rounded-[12px] border border-default bg-muted p-4"
              @select="select"
            />
            <SlotDetails
              :selected="selectedOf(data, levelOf(data))"
              :busy="slotChange.isPending.value"
              class="lg:sticky lg:top-4"
              @change="run"
            />
          </div>
        </template>
      </template>

      <template #loading>
        <div class="space-y-4">
          <USkeleton class="h-10 w-80 max-w-full rounded-[10px]" />
          <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <USkeleton class="h-80 rounded-[12px]" />
            <USkeleton class="h-56 rounded-[12px]" />
          </div>
        </div>
      </template>
    </GaragePageFrame>
  </div>
</template>
