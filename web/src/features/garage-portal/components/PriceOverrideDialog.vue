<script setup lang="ts">
import { computed, reactive, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  addDays,
  checkOverride,
  createOverrideSchema,
  MAX_OVERRIDE_DAYS,
  type PriceOverrideValues,
  type SettingsMessage,
} from '../model/lot-settings'

/**
 * Add or edit one special price (Eid, Newroz, a match day). Nothing is sent
 * from here: the rule goes into the page's list and is saved with the page.
 */
const {
  rule = null,
  today,
  others,
} = defineProps<{
  /** The special price being edited; null to add one. */
  rule?: PriceOverrideValues | null
  /** The server's day: a special price can't end before it. */
  today: string
  /** The other special prices in the list: two can't share a day. */
  others: readonly PriceOverrideValues[]
}>()
const emit = defineEmits<{ save: [rule: PriceOverrideValues] }>()
const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const formId = useId()

const message: SettingsMessage = (key, params) =>
  t(`garagePortal.settings.errors.${key}`, params ?? {})
const schema = computed(() => createOverrideSchema(message))
// Reads the form's own state: UForm passes a loosely typed copy.
const validate = () => checkOverride(state, today, others, message)

const blank = (): PriceOverrideValues => ({
  label: '',
  start_date: addDays(today, 1),
  end_date: addDays(today, 1),
  price_per_hour: undefined,
  daily_cap: undefined,
})
const state = reactive<PriceOverrideValues>(blank())

// Start fresh every time it opens.
watch(
  open,
  (isOpen) => {
    if (isOpen) Object.assign(state, rule ? { ...rule } : blank())
  },
  { immediate: true },
)

// Picking a first day after the last moves the last day along with it.
watch(
  () => state.start_date,
  (start) => {
    if (start && state.end_date && state.end_date < start) state.end_date = start
  },
)

function onSubmit() {
  emit('save', {
    ...state,
    label: state.label.trim(),
    daily_cap: state.daily_cap ?? undefined,
  })
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="
      rule
        ? t('garagePortal.settings.overrides.editTitle')
        : t('garagePortal.settings.overrides.addTitle')
    "
    :description="t('garagePortal.settings.overrides.dialogDescription')"
  >
    <template #body>
      <UForm
        :id="formId"
        :schema
        :validate
        :state
        class="grid gap-4 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('garagePortal.settings.overrides.label')"
          name="label"
          required
          class="sm:col-span-2"
        >
          <UInput
            v-model="state.label"
            :maxlength="60"
            :placeholder="t('garagePortal.settings.overrides.labelPlaceholder')"
            class="w-full"
          />
        </UFormField>
        <UFormField
          :label="t('garagePortal.settings.overrides.startDate')"
          name="start_date"
          required
        >
          <UInput v-model="state.start_date" type="date" dir="ltr" class="w-full" />
        </UFormField>
        <UFormField
          :label="t('garagePortal.settings.overrides.endDate')"
          name="end_date"
          required
          :help="t('garagePortal.settings.overrides.endDateHelp', { max: MAX_OVERRIDE_DAYS })"
        >
          <UInput
            v-model="state.end_date"
            type="date"
            dir="ltr"
            :min="state.start_date || today"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="t('garagePortal.settings.pricePerHour')" name="price_per_hour" required>
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
          :label="t('garagePortal.settings.dailyCap')"
          name="daily_cap"
          :help="t('garagePortal.settings.overrides.capHelp')"
        >
          <UInput
            v-model.optional="state.daily_cap"
            type="number"
            :min="0"
            step="500"
            class="w-full"
            :ui="{ trailing: 'pointer-events-none' }"
          >
            <template #trailing>
              <span class="text-xs text-dimmed">{{ t('common.iqd') }}</span>
            </template>
          </UInput>
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" @click="open = false">
          {{ t('garagePortal.settings.cancel') }}
        </UButton>
        <UButton type="submit" :form="formId">
          {{
            rule
              ? t('garagePortal.settings.overrides.update')
              : t('garagePortal.settings.overrides.add')
          }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
