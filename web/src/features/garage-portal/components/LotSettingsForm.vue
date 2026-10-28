<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'

import { ApiError } from '@/shared/api/errors'
import { formatDayRange, formatInteger } from '@/shared/lib/format'

import { useSaveLotSettings } from '../composables/useLotSettings'
import {
  checkDailyCap,
  createSettingsSchema,
  daysInRange,
  formFromSettings,
  hoursToCap,
  isRunning,
  MAX_FREE_CANCELLATION_MINUTES,
  MAX_PRICE_OVERRIDES,
  settingsChanged,
  sortOverrides,
  toSettingsBody,
  type LotSettingsValues,
  type PriceOverrideValues,
  type SettingsMessage,
} from '../model/lot-settings'
import type { LotSettings } from '../model/portal.schemas'

import PriceOverrideDialog from './PriceOverrideDialog.vue'

/** The Lot Settings form for one garage, filled from what the server has. */
const { settings } = defineProps<{ settings: LotSettings }>()

const { t, locale } = useI18n()
const save = useSaveLotSettings(() => settings.id)

const message: SettingsMessage = (key, params) =>
  t(`garagePortal.settings.errors.${key}`, params ?? {})
const schema = computed(() => createSettingsSchema(message))
// Reads the form's own state: UForm passes a loosely typed copy.
const validate = () => checkDailyCap(state, message)

const state = reactive<LotSettingsValues>(formFromSettings(settings))
// Saved (or reloaded): the form shows what the server has now.
watch(
  () => settings,
  (next) => Object.assign(state, formFromSettings(next)),
)

const isDirty = computed(() => settingsChanged(state, settings))
const saving = computed(() => save.isPending.value)
const serverError = ref('')
const alertBox = useTemplateRef<HTMLElement>('alertBox')

const iqd = (amount: number) => `${formatInteger(amount)} ${t('common.iqd')}`

const capHint = computed(() => {
  const hours = state.has_daily_cap ? hoursToCap(state.price_per_hour, state.daily_cap) : null
  return hours === null
    ? ''
    : t('garagePortal.settings.capHint', { hours, cap: iqd(state.daily_cap ?? 0) })
})

// ---------------------------------------------------------- special prices

const overrides = computed(() => sortOverrides(state.price_overrides))
const dialogOpen = ref(false)
/** The special price being edited; null while adding one. */
const editing = ref<PriceOverrideValues | null>(null)
const others = computed(() => state.price_overrides.filter((rule) => rule !== editing.value))

function addOverride() {
  editing.value = null
  dialogOpen.value = true
}

function editOverride(rule: PriceOverrideValues) {
  editing.value = rule
  dialogOpen.value = true
}

function removeOverride(rule: PriceOverrideValues) {
  state.price_overrides = state.price_overrides.filter((other) => other !== rule)
}

function onOverrideSaved(rule: PriceOverrideValues) {
  const index = editing.value ? state.price_overrides.indexOf(editing.value) : -1
  if (index >= 0) state.price_overrides.splice(index, 1, rule)
  else state.price_overrides.push(rule)
}

function overridePrice(rule: PriceOverrideValues): string {
  const perHour = t('garagePortal.settings.overrides.perHour', {
    price: iqd(rule.price_per_hour ?? 0),
  })
  const cap =
    rule.daily_cap === undefined
      ? t('garagePortal.settings.overrides.noCap')
      : t('garagePortal.settings.overrides.capped', { cap: iqd(rule.daily_cap) })
  return `${perHour} · ${cap}`
}

// ----------------------------------------------------------- save, discard

function discard() {
  Object.assign(state, formFromSettings(settings))
  serverError.value = ''
}

async function onSubmit() {
  serverError.value = ''
  try {
    await save.mutateAsync(toSettingsBody(state))
  } catch (error) {
    if (error instanceof ApiError && error.kind === 'network') {
      serverError.value = t('common.errors.network')
    } else if (error instanceof ApiError && error.message !== '') {
      serverError.value = error.message
    } else {
      serverError.value = t('common.errors.generic')
    }
    void nextTick(() => alertBox.value?.scrollIntoView?.({ block: 'nearest' }))
  }
}

/** Puts the cursor in the first field to fix. */
function onError(event: FormErrorEvent) {
  const id = event.errors[0]?.id
  void nextTick(() => {
    const target = id
      ? document.getElementById(id)
      : document.querySelector<HTMLElement>('#lot-settings [aria-invalid="true"]')
    target?.focus()
  })
}

// ------------------------------------------------- don't lose unsaved edits

const leaveOpen = ref(false)
let decideLeave: ((leave: boolean) => void) | null = null

onBeforeRouteLeave(() => {
  if (!isDirty.value) return true
  leaveOpen.value = true
  return new Promise<boolean>((resolve) => (decideLeave = resolve))
})

function answerLeave(leave: boolean) {
  const decide = decideLeave
  decideLeave = null
  leaveOpen.value = false
  decide?.(leave)
}
// Closed with Escape or outside the dialog: stay.
watch(leaveOpen, (isOpen) => {
  if (!isOpen && decideLeave) answerLeave(false)
})

/** Closing or reloading the tab: the browser asks with its own dialog. */
function onBeforeUnload(event: BeforeUnloadEvent) {
  if (isDirty.value) event.preventDefault()
}
onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
</script>

<template>
  <UForm
    id="lot-settings"
    :schema
    :validate
    :state
    :loading-auto="false"
    :disabled="saving"
    class="space-y-4"
    @submit="onSubmit"
    @error="onError"
  >
    <div class="grid items-start gap-4 xl:grid-cols-2">
      <!-- Lot information -->
      <section
        aria-labelledby="settings-details"
        class="space-y-4 rounded-[12px] border border-default bg-muted p-5"
      >
        <h2 id="settings-details" class="text-sm font-medium text-highlighted">
          {{ t('garagePortal.settings.sections.details') }}
        </h2>
        <UFormField :label="t('garagePortal.settings.name')" name="name" required>
          <UInput v-model="state.name" :maxlength="100" class="w-full" />
        </UFormField>
        <UFormField :label="t('garagePortal.settings.address')" name="address" required>
          <UInput v-model="state.address" :maxlength="255" class="w-full" />
        </UFormField>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField :label="t('garagePortal.settings.city')" name="city" required>
            <UInput v-model="state.city" :maxlength="100" class="w-full" />
          </UFormField>
          <div>
            <p class="text-sm font-medium text-default">
              {{ t('garagePortal.settings.totalSlots') }}
            </p>
            <p class="mt-1.5 text-sm text-highlighted" data-total-slots>
              {{ formatInteger(settings.total_slots) }}
            </p>
            <ULink :to="{ name: 'garage.slots' }" class="text-xs text-primary hover:underline">
              {{ t('garagePortal.settings.manageSlots') }}
            </ULink>
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section
        aria-labelledby="settings-pricing"
        class="space-y-4 rounded-[12px] border border-default bg-muted p-5"
      >
        <h2 id="settings-pricing" class="text-sm font-medium text-highlighted">
          {{ t('garagePortal.settings.sections.pricing') }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField
            :label="t('garagePortal.settings.pricePerHour')"
            name="price_per_hour"
            required
          >
            <UInput
              v-model.optional="state.price_per_hour"
              type="number"
              :min="0"
              step="250"
              class="w-full"
              :ui="{ trailing: 'pointer-events-none' }"
            >
              <template #trailing>
                <span class="text-xs text-dimmed">{{ t('common.iqd') }}</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField
            :label="t('garagePortal.settings.freeCancellation')"
            name="free_cancellation_minutes"
            :help="
              t('garagePortal.settings.freeCancellationHelp', {
                max: MAX_FREE_CANCELLATION_MINUTES,
              })
            "
            required
          >
            <UInput
              v-model.optional="state.free_cancellation_minutes"
              type="number"
              :min="0"
              :max="MAX_FREE_CANCELLATION_MINUTES"
              class="w-full"
              :ui="{ trailing: 'pointer-events-none' }"
            >
              <template #trailing>
                <span class="text-xs text-dimmed">{{ t('garagePortal.settings.minutes') }}</span>
              </template>
            </UInput>
          </UFormField>
        </div>
        <UFormField name="has_daily_cap">
          <USwitch v-model="state.has_daily_cap" :label="t('garagePortal.settings.capSwitch')" />
        </UFormField>
        <UFormField
          v-if="state.has_daily_cap"
          :label="t('garagePortal.settings.dailyCap')"
          name="daily_cap"
          :help="capHint || t('garagePortal.settings.capHelp')"
          required
        >
          <UInput
            v-model.optional="state.daily_cap"
            type="number"
            :min="0"
            step="500"
            class="w-full sm:w-1/2"
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <span class="text-xs text-dimmed">{{ t('common.iqd') }}</span>
            </template>
          </UInput>
        </UFormField>
      </section>

      <!-- Special prices -->
      <section
        aria-labelledby="settings-overrides"
        class="space-y-3 rounded-[12px] border border-default bg-muted p-5 xl:col-span-2"
        data-overrides
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="settings-overrides" class="text-sm font-medium text-highlighted">
              {{ t('garagePortal.settings.sections.overrides') }}
            </h2>
            <p class="mt-1 text-xs text-muted">{{ t('garagePortal.settings.overrides.help') }}</p>
          </div>
          <UButton
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            size="sm"
            :disabled="state.price_overrides.length >= MAX_PRICE_OVERRIDES"
            @click="addOverride"
          >
            {{ t('garagePortal.settings.overrides.add') }}
          </UButton>
        </div>

        <p v-if="overrides.length === 0" class="py-2 text-sm text-muted">
          {{ t('garagePortal.settings.overrides.empty') }}
        </p>
        <ul v-else class="divide-y divide-default">
          <li
            v-for="rule in overrides"
            :key="`${rule.start_date}-${rule.label}`"
            class="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
            data-override
          >
            <div class="min-w-0 flex-1">
              <p class="flex items-center gap-2 text-sm font-medium text-highlighted">
                <span dir="auto" class="truncate">{{ rule.label }}</span>
                <UBadge
                  v-if="isRunning(rule, settings.today)"
                  color="success"
                  variant="soft"
                  size="sm"
                  :label="t('garagePortal.settings.overrides.running')"
                />
              </p>
              <p class="text-xs text-muted">
                {{ formatDayRange(rule.start_date, rule.end_date, locale) }} ·
                {{
                  t(
                    'garagePortal.settings.overrides.days',
                    { count: daysInRange(rule.start_date, rule.end_date) },
                    daysInRange(rule.start_date, rule.end_date),
                  )
                }}
              </p>
            </div>
            <p class="text-sm text-default">{{ overridePrice(rule) }}</p>
            <div class="flex gap-1">
              <UButton
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
                :aria-label="t('garagePortal.settings.overrides.edit', { label: rule.label })"
                @click="editOverride(rule)"
              />
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="sm"
                :aria-label="t('garagePortal.settings.overrides.remove', { label: rule.label })"
                @click="removeOverride(rule)"
              />
            </div>
          </li>
        </ul>
        <p v-if="state.price_overrides.length >= MAX_PRICE_OVERRIDES" class="text-xs text-muted">
          {{ t('garagePortal.settings.overrides.limit', { max: MAX_PRICE_OVERRIDES }) }}
        </p>
      </section>

      <!-- Opening hours -->
      <section
        aria-labelledby="settings-hours"
        class="space-y-4 rounded-[12px] border border-default bg-muted p-5"
      >
        <h2 id="settings-hours" class="text-sm font-medium text-highlighted">
          {{ t('garagePortal.settings.sections.hours') }}
        </h2>
        <UFormField name="is_open_24h">
          <USwitch v-model="state.is_open_24h" :label="t('garagePortal.settings.open24h')" />
        </UFormField>
        <div v-if="!state.is_open_24h" class="grid gap-4 sm:grid-cols-2">
          <UFormField
            :label="t('garagePortal.settings.openingTime')"
            name="opening_time"
            required
            :help="t('garagePortal.settings.hoursHelp')"
          >
            <UInput v-model="state.opening_time" type="time" dir="ltr" class="w-full" />
          </UFormField>
          <UFormField :label="t('garagePortal.settings.closingTime')" name="closing_time" required>
            <UInput v-model="state.closing_time" type="time" dir="ltr" class="w-full" />
          </UFormField>
        </div>
      </section>

      <!-- Amenities -->
      <section
        aria-labelledby="settings-amenities"
        class="space-y-4 rounded-[12px] border border-default bg-muted p-5"
      >
        <h2 id="settings-amenities" class="text-sm font-medium text-highlighted">
          {{ t('garagePortal.settings.sections.amenities') }}
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <UCheckbox v-model="state.has_cctv" :label="t('garages.detail.amenity.cctv')" />
          <UCheckbox
            v-model="state.has_ev_charging"
            :label="t('garages.detail.amenity.ev_charging')"
          />
          <UCheckbox v-model="state.is_covered" :label="t('garages.detail.amenity.covered')" />
          <UCheckbox
            v-model="state.is_accessible"
            :label="t('garages.detail.amenity.accessible')"
          />
        </div>
      </section>
    </div>

    <!-- Announced by screen readers as soon as it appears. -->
    <div ref="alertBox" role="alert" class="empty:hidden">
      <UAlert
        v-if="serverError"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :title="serverError"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <UButton type="submit" :loading="saving" :disabled="!isDirty">
        {{ t('garagePortal.settings.save') }}
      </UButton>
      <UButton color="neutral" variant="outline" :disabled="!isDirty || saving" @click="discard">
        {{ t('garagePortal.settings.discard') }}
      </UButton>
      <p class="text-sm text-muted" aria-live="polite">
        <span v-if="isDirty">{{ t('garagePortal.settings.unsaved') }}</span>
      </p>
    </div>
    <p class="text-xs text-muted">{{ t('garagePortal.settings.pricesNote') }}</p>
  </UForm>

  <PriceOverrideDialog
    v-model:open="dialogOpen"
    :rule="editing"
    :today="settings.today"
    :others
    @save="onOverrideSaved"
  />

  <UModal
    v-model:open="leaveOpen"
    :title="t('garagePortal.settings.leave.title')"
    :description="t('garagePortal.settings.leave.description')"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="answerLeave(false)">
          {{ t('garagePortal.settings.leave.stay') }}
        </UButton>
        <UButton color="error" @click="answerLeave(true)">
          {{ t('garagePortal.settings.leave.leave') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
