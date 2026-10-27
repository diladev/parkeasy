<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatDateTime, formatInteger, formatTime } from '@/shared/lib/format'
import { levelLabel } from '@/shared/lib/level-label'

import type { LiveSlot, SlotAction } from '../model/portal.schemas'
import { SLOT_TONE, slotActionFor } from '../model/slots'

/** The selected slot: who holds it, and the one thing the owner can do with it. */
const { selected: slot, busy = false } = defineProps<{
  selected: LiveSlot | null
  busy?: boolean
}>()
const emit = defineEmits<{ action: [action: SlotAction] }>()

const { t, locale } = useI18n()
const headingId = useId()

const option = computed(() => (slot ? slotActionFor(slot) : null))

/** Only the wallet exists today; a future method shows as the API names it. */
const paidWith = (method: string) =>
  method === 'wallet' ? t('garagePortal.slots.details.paidWith.wallet') : method
</script>

<template>
  <section
    class="rounded-[12px] border border-default bg-muted p-4"
    :aria-labelledby="headingId"
    data-slot-details
  >
    <h2 :id="headingId" class="sr-only">{{ t('garagePortal.slots.details.title') }}</h2>

    <p v-if="!slot" class="text-sm text-muted">{{ t('garagePortal.slots.details.select') }}</p>

    <template v-else>
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-lg font-medium text-highlighted">
            {{ t('garagePortal.slots.details.slot', { slot: slot.slot_number }) }}
          </p>
          <p class="text-xs text-dimmed">
            {{ levelLabel(slot.level, t) }} <span dir="ltr">({{ slot.level }})</span>
          </p>
        </div>
        <span
          class="inline-flex items-center gap-1.5 rounded-[7px] border px-2 py-0.5 text-xs font-medium"
          :class="[SLOT_TONE[slot.status].tile, SLOT_TONE[slot.status].text]"
        >
          {{ t(`garagePortal.slots.status.${slot.status}`) }}
        </span>
      </div>

      <dl v-if="slot.booking" class="mt-4 space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.customer') }}</dt>
          <dd dir="auto" class="text-end text-highlighted">
            {{ slot.booking.customer?.name ?? t('bookings.deletedAccount') }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.vehicle') }}</dt>
          <dd class="text-end text-highlighted">
            <template v-if="slot.booking.vehicle"
              >{{ `${slot.booking.vehicle.brand} ${slot.booking.vehicle.model} · `
              }}<span dir="ltr" class="whitespace-nowrap">{{
                slot.booking.vehicle.license_plate
              }}</span></template
            >
            <span v-else aria-hidden="true">—</span>
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.booked') }}</dt>
          <dd class="text-end text-highlighted">
            {{ formatDateTime(slot.booking.start_time, locale) }}
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.ends') }}</dt>
          <dd class="text-end text-highlighted">
            <span dir="ltr">{{ formatTime(slot.booking.end_time) }}</span>
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.amount') }}</dt>
          <dd class="text-end text-highlighted">
            {{ formatInteger(slot.booking.total_cost) }} {{ t('common.iqd') }} ·
            {{ paidWith(slot.booking.payment_method) }}
          </dd>
        </div>
      </dl>

      <p class="mt-4 text-sm text-muted">
        {{ t(`garagePortal.slots.notes.${slot.booking ? 'reserved' : slot.status}`) }}
      </p>

      <UButton
        v-if="option"
        block
        class="mt-4"
        :color="option.action === 'block' ? 'neutral' : 'primary'"
        :variant="option.action === 'block' ? 'outline' : 'solid'"
        :icon="option.action === 'block' ? 'i-lucide-construction' : 'i-lucide-circle-check'"
        :loading="busy"
        @click="emit('action', option.action)"
      >
        {{ t(`garagePortal.slots.actions.${option.label}`) }}
      </UButton>
    </template>
  </section>
</template>
