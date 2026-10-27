<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { LiveSlot } from '../model/portal.schemas'
import { SLOT_TONE } from '../model/slots'

/** One level's slots as tiles. Each tile is a button that opens its details. */
const { slots, selectedId, label } = defineProps<{
  slots: LiveSlot[]
  selectedId: number | null
  /** "Slots on Ground floor" */
  label: string
}>()
const emit = defineEmits<{ select: [slot: LiveSlot] }>()

const { t } = useI18n()
</script>

<template>
  <ul :aria-label="label" class="grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2.5">
    <li v-for="slot in slots" :key="slot.id">
      <button
        type="button"
        :data-slot-id="slot.id"
        :aria-pressed="slot.id === selectedId"
        class="flex h-16 w-full flex-col items-center justify-center gap-0.5 rounded-[10px] border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        :class="[
          SLOT_TONE[slot.status].tile,
          slot.id === selectedId
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-(--ui-bg)'
            : 'hover:brightness-125',
        ]"
        @click="emit('select', slot)"
      >
        <span dir="ltr" class="text-sm font-semibold text-highlighted">{{ slot.slot_number }}</span>
        <span class="text-xs" :class="SLOT_TONE[slot.status].text">
          {{ t(`garagePortal.slots.status.${slot.status}`) }}
        </span>
      </button>
    </li>
  </ul>
</template>
