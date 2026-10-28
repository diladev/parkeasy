<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, nextTick, reactive, ref, useId, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatDateTime, formatDay, formatInteger, formatTime } from '@/shared/lib/format'
import { levelLabel } from '@/shared/lib/level-label'

import type { SlotChange } from '../composables/useLiveSlots'
import { splitMinutes } from '../model/dashboard-figures'
import type { LiveSlot, PriceQuote } from '../model/portal.schemas'
import {
  createPlateSchema,
  minutesSince,
  situationOf,
  SLOT_TONE,
  slotActionFor,
} from '../model/slots'
import WalkInDialog from './WalkInDialog.vue'

/** The selected slot: who holds it, and what the owner can do with it. */
const { selected: slot, busy = false } = defineProps<{
  selected: LiveSlot | null
  busy?: boolean
}>()
/** `done` is called once the server accepted the change. */
const emit = defineEmits<{ change: [change: SlotChange, done: () => void] }>()

const { t, locale } = useI18n()
const headingId = useId()

const situation = computed(() => (slot ? situationOf(slot) : null))
const option = computed(() => (slot ? slotActionFor(slot) : null))

const iqd = (value: number) => `${formatInteger(value)} ${t('common.iqd')}`
/** Only the wallet exists for app bookings today; anything else shows as the API names it. */
const paidWith = (method: string) =>
  method === 'wallet' ? t('garagePortal.slots.details.paidWith.wallet') : method

/**
 * How the fee so far adds up: "2 h × 1,500 IQD", or a line per day when the
 * stay crossed midnight, hit the daily cap or falls on a special price.
 */
function feeLines(quote: PriceQuote): string[] {
  const details = 'garagePortal.slots.details'
  const named = (text: string, label: string | null) => (label ? `${text} (${label})` : text)
  const [only] = quote.days
  if (quote.days.length === 1 && only) {
    const text = only.capped
      ? t(`${details}.feeCapped`, { hours: only.hours, cap: iqd(only.daily_cap ?? 0) })
      : t(`${details}.feeRule`, { hours: only.hours, price: iqd(only.price_per_hour) })
    return [named(text, only.label)]
  }
  return quote.days.map((day) => {
    const date = formatDay(day.date, locale.value)
    const text = day.capped
      ? t(`${details}.feeDayCapped`, { day: date, hours: day.hours, cap: iqd(day.daily_cap ?? 0) })
      : t(`${details}.feeDay`, { day: date, hours: day.hours, price: iqd(day.price_per_hour) })
    return named(text, day.label)
  })
}

function duration(minutes: number): string {
  const parts = splitMinutes(minutes)
  if (parts.hours === 0) return t('garagePortal.duration.minutes', parts)
  if (parts.minutes === 0) return t('garagePortal.duration.hours', parts)
  return t('garagePortal.duration.hoursMinutes', parts)
}

// ------------------------------------------------------------- walk-in form

const isStarting = ref(false)
const plateState = reactive({ plate: '' })
const plateSchema = computed(() => createPlateSchema(t('garagePortal.slots.walkIn.plateInvalid')))
const plateField = useTemplateRef<{ inputRef?: HTMLInputElement }>('plateInput')

async function openStart() {
  plateState.plate = ''
  isStarting.value = true
  await nextTick()
  plateField.value?.inputRef?.focus()
}

function onStart(event: FormSubmitEvent<{ plate: string }>) {
  if (!slot) return
  emit('change', { kind: 'walk-in', slotId: slot.id, plate: event.data.plate }, () => {
    isStarting.value = false
  })
}

// ------------------------------------------------------------- end / remove

const dialog = ref<'end' | 'remove' | null>(null)
const isDialogOpen = computed({
  get: () => dialog.value !== null,
  set: (open) => {
    if (!open) dialog.value = null
  },
})

// Another slot selected, or this one changed under us: start over.
watch(
  () => [slot?.id, slot?.status],
  () => {
    isStarting.value = false
    dialog.value = null
  },
)

function end(method: 'cash' | 'card') {
  if (!slot?.booking) return
  emit(
    'change',
    { kind: 'end-walk-in', bookingId: slot.booking.id, paymentMethod: method },
    () => (dialog.value = null),
  )
}

function remove() {
  if (!slot?.booking) return
  emit(
    'change',
    { kind: 'remove-walk-in', bookingId: slot.booking.id },
    () => (dialog.value = null),
  )
}
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

      <!-- A driver's app booking. -->
      <dl v-if="situation === 'booked' && slot.booking" class="mt-4 space-y-3 text-sm">
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
        <div v-if="slot.booking.end_time" class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.ends') }}</dt>
          <dd class="text-end text-highlighted">
            <span dir="ltr">{{ formatTime(slot.booking.end_time) }}</span>
          </dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.amount') }}</dt>
          <dd class="text-end text-highlighted">
            {{ iqd(slot.booking.total_cost) }} ·
            {{ paidWith(slot.booking.payment_method) }}
          </dd>
        </div>
      </dl>

      <!-- A car parked without the app. -->
      <dl v-else-if="situation === 'walk-in' && slot.booking" class="mt-4 space-y-3 text-sm">
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.plate') }}</dt>
          <dd dir="ltr" class="text-end font-medium text-highlighted">{{ slot.booking.plate }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.parkedSince') }}</dt>
          <dd class="text-end text-highlighted">
            <span dir="ltr">{{ formatTime(slot.booking.start_time) }}</span>
            <span class="text-muted"> · {{ duration(minutesSince(slot.booking.start_time)) }}</span>
          </dd>
        </div>
        <div v-if="slot.booking.charge_now" class="flex justify-between gap-4">
          <dt class="text-muted">{{ t('garagePortal.slots.details.feeSoFar') }}</dt>
          <dd class="text-end text-highlighted">
            {{ iqd(slot.booking.charge_now.amount) }}
            <span
              v-for="line in feeLines(slot.booking.charge_now)"
              :key="line"
              class="block text-xs text-muted"
              >{{ line }}</span
            >
          </dd>
        </div>
      </dl>

      <p class="mt-4 text-sm text-muted">
        {{ t(`garagePortal.slots.notes.${situation}`) }}
      </p>

      <!-- Free: start a walk-in. -->
      <template v-if="situation === 'free'">
        <UForm
          v-if="isStarting"
          :schema="plateSchema"
          :state="plateState"
          class="mt-4 space-y-3"
          @submit="onStart"
        >
          <UFormField
            :label="t('garagePortal.slots.walkIn.plate')"
            name="plate"
            :help="t('garagePortal.slots.walkIn.plateHelp')"
          >
            <UInput
              ref="plateInput"
              v-model="plateState.plate"
              dir="ltr"
              autocomplete="off"
              :placeholder="t('garagePortal.slots.walkIn.platePlaceholder')"
              class="w-full"
            />
          </UFormField>
          <div class="flex gap-2">
            <UButton type="submit" class="flex-1 justify-center" :loading="busy">
              {{ t('garagePortal.slots.walkIn.submit') }}
            </UButton>
            <UButton color="neutral" variant="outline" :disabled="busy" @click="isStarting = false">
              {{ t('garagePortal.slots.walkIn.cancel') }}
            </UButton>
          </div>
        </UForm>
        <UButton v-else block class="mt-4" icon="i-lucide-car" :disabled="busy" @click="openStart">
          {{ t('garagePortal.slots.walkIn.start') }}
        </UButton>
      </template>

      <!-- A walk-in: end and charge, or remove a mistake. -->
      <template v-if="situation === 'walk-in' && slot.booking">
        <UButton
          block
          class="mt-4"
          icon="i-lucide-receipt"
          :disabled="busy"
          @click="dialog = 'end'"
        >
          {{ t('garagePortal.slots.walkIn.end') }}
        </UButton>
        <UButton
          block
          class="mt-2"
          color="neutral"
          variant="link"
          size="sm"
          :disabled="busy"
          @click="dialog = 'remove'"
        >
          {{ t('garagePortal.slots.walkIn.remove') }}
        </UButton>
        <WalkInDialog
          v-model:open="isDialogOpen"
          :mode="dialog ?? 'end'"
          :plate="slot.booking.plate ?? ''"
          :amount="slot.booking.charge_now?.amount ?? 0"
          :price-per-hour="slot.booking.price_per_hour"
          :busy
          @end="end"
          @remove="remove"
        />
      </template>

      <UButton
        v-if="option && !isStarting"
        block
        :class="situation === 'free' ? 'mt-2' : 'mt-4'"
        :color="option.action === 'block' ? 'neutral' : 'primary'"
        :variant="option.action === 'block' ? 'outline' : 'solid'"
        :icon="option.action === 'block' ? 'i-lucide-construction' : 'i-lucide-circle-check'"
        :loading="busy"
        @click="emit('change', { kind: option.action, slotId: slot.id }, () => undefined)"
      >
        {{ t(`garagePortal.slots.actions.${option.label}`) }}
      </UButton>
    </template>
  </section>
</template>
