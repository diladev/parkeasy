<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { isolate } from '@/shared/lib/bidi'
import { formatInteger } from '@/shared/lib/format'

import { useSaveGarage } from '../composables/useSaveGarage'
import { mapLink } from '../model/garage-figures'
import {
  createGarageFormSchema,
  emptyGarageForm,
  formFromGarage,
  MAX_FREE_CANCELLATION_MINUTES,
  MAX_LEVELS,
  MAX_SLOTS_PER_LEVEL,
  nextLevel,
  normalizeLevel,
  parseCoordinates,
  toCreateBody,
  toUpdateBody,
  totalSlots,
  type FormMessage,
  type GarageFormValues,
} from '../model/garage-form'
import type { GarageDetail, GarageSaved } from '../model/garage.schemas'

/** One form for both: "Add garage" (no garage) and "Edit details" (the garage being edited). */
const { garage = null } = defineProps<{ garage?: GarageDetail | null }>()
const emit = defineEmits<{ saved: [result: GarageSaved] }>()
const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const save = useSaveGarage()

const mode = computed(() => (garage ? 'edit' : 'create'))
const FORM_ID = 'garage-form'

const message: FormMessage = (key, params) => t(`garages.form.errors.${key}`, params ?? {})
const state = reactive<GarageFormValues>(emptyGarageForm())
const schema = computed(() => createGarageFormSchema(message, mode.value, state.withOwner))
/** What the form held when it opened, to tell whether anything changed. */
let initial = ''
const serverError = ref('')
const serverDetails = ref<readonly string[]>([])
const alertBox = useTemplateRef<HTMLElement>('alertBox')
const form = useTemplateRef<{ validate: (options: { silent: boolean }) => Promise<unknown> }>(
  'form',
)
/** After a failed submit, messages clear as soon as a field is fixed, not on blur. */
const hasTriedSubmit = ref(false)

// Start fresh every time it opens: a new form, or the garage as it is now.
watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    Object.assign(state, garage ? formFromGarage(garage) : emptyGarageForm())
    initial = JSON.stringify(state)
    hasTriedSubmit.value = false
    serverError.value = ''
    serverDetails.value = []
  },
  { immediate: true },
)

const isDirty = computed(() => JSON.stringify(state) !== initial)

// Without this, a message under a field only goes away when the field loses focus,
// and the layout jumps just as the admin clicks the next button.
watch(
  () => JSON.stringify(state),
  () => {
    if (hasTriedSubmit.value) void form.value?.validate({ silent: true })
  },
)
const saving = computed(() => save.isPending.value)

const point = computed(() => parseCoordinates(state.coordinates))
const slotsTotal = computed(() => totalSlots(state.levels))

function addLevel() {
  state.levels.push({ level: nextLevel(state.levels), slots: undefined })
}

function removeLevel(index: number) {
  state.levels.splice(index, 1)
}

/** The server's message is already translated; 5xx and network errors get ours. */
function showServerError(error: unknown) {
  if (error instanceof ApiError && error.kind === 'network') {
    serverError.value = t('common.errors.network')
    serverDetails.value = []
  } else if (error instanceof ApiError && error.message !== '') {
    serverError.value = error.message
    serverDetails.value = error.details.length > 1 ? error.details : []
  } else {
    serverError.value = t('common.errors.generic')
    serverDetails.value = []
  }
  void nextTick(() => alertBox.value?.scrollIntoView?.({ block: 'nearest' }))
}

async function onSubmit() {
  serverError.value = ''
  if (!garage) {
    await submit({ mode: 'create', body: toCreateBody(state) })
    return
  }
  const body = toUpdateBody(state, garage)
  // e.g. "35.5571,45.4356" retyped as "35.5571, 45.4356": nothing to send.
  if (Object.keys(body).length === 0) {
    open.value = false
    return
  }
  await submit({ mode: 'edit', id: garage.id, body })
}

async function submit(request: Parameters<typeof save.mutateAsync>[0]) {
  try {
    const result = await save.mutateAsync(request)
    open.value = false
    emit('saved', result)
  } catch (error) {
    showServerError(error)
  }
}

/** Take keyboard and screen-reader users to the first field to fix. */
function onError(event: FormErrorEvent) {
  hasTriedSubmit.value = true
  const id = event.errors[0]?.id
  if (id) document.getElementById(id)?.focus()
}

const title = computed(() =>
  garage ? t('garages.form.editTitle', { name: isolate(garage.name) }) : t('garages.form.addTitle'),
)
const description = computed(() =>
  garage ? t('garages.form.editDescription') : t('garages.form.addDescription'),
)
</script>

<template>
  <!-- Nuxt UI's modal traps focus, closes on Escape and returns focus afterwards. -->
  <UModal
    v-model:open="open"
    :title
    :description
    :dismissible="!saving"
    scrollable
    :ui="{ content: 'sm:max-w-2xl' }"
  >
    <template #body>
      <UForm
        :id="FORM_ID"
        ref="form"
        :schema
        :state
        :loading-auto="false"
        :disabled="saving"
        class="space-y-6"
        @submit="onSubmit"
        @error="onError"
      >
        <!-- Announced by screen readers as soon as it appears. -->
        <div ref="alertBox" role="alert" class="empty:hidden">
          <UAlert
            v-if="serverError"
            color="error"
            variant="subtle"
            icon="i-lucide-circle-alert"
            :title="serverError"
          >
            <template v-if="serverDetails.length" #description>
              <ul class="list-disc ps-4">
                <li v-for="detail in serverDetails" :key="detail">{{ detail }}</li>
              </ul>
            </template>
          </UAlert>
        </div>

        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-medium text-highlighted">
            {{ t('garages.form.sections.details') }}
          </legend>
          <UFormField :label="t('garages.form.name')" name="name" required class="sm:col-span-2">
            <UInput v-model="state.name" :maxlength="100" class="w-full" />
          </UFormField>
          <UFormField :label="t('garages.form.address')" name="address" required>
            <UInput v-model="state.address" :maxlength="255" class="w-full" />
          </UFormField>
          <UFormField :label="t('garages.form.city')" name="city" required>
            <UInput v-model="state.city" :maxlength="100" class="w-full" />
          </UFormField>
          <UFormField
            :label="t('garages.form.coordinates')"
            name="coordinates"
            :help="t('garages.form.coordinatesHelp')"
            required
            class="sm:col-span-2"
          >
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <UInput
                v-model="state.coordinates"
                dir="ltr"
                inputmode="decimal"
                placeholder="35.5571, 45.4356"
                class="w-full sm:w-64"
              />
              <ULink
                v-if="point"
                :to="mapLink(point.latitude, point.longitude)"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-primary"
              >
                {{ t('garages.form.checkOnMap') }}
                <span class="sr-only">{{ t('common.opensInNewTab') }}</span>
              </ULink>
            </div>
          </UFormField>
        </fieldset>

        <fieldset class="grid gap-4 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-medium text-highlighted">
            {{ t('garages.form.sections.priceAndHours') }}
          </legend>
          <UFormField :label="t('garages.form.pricePerHour')" name="price_per_hour" required>
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
            :label="t('garages.form.freeCancellation')"
            name="free_cancellation_minutes"
            :help="t('garages.form.freeCancellationHelp', { max: MAX_FREE_CANCELLATION_MINUTES })"
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
                <span class="text-xs text-dimmed">{{ t('garages.form.minutes') }}</span>
              </template>
            </UInput>
          </UFormField>
          <UFormField name="is_open_24h" class="sm:col-span-2">
            <USwitch v-model="state.is_open_24h" :label="t('garages.form.open24h')" />
          </UFormField>
          <template v-if="!state.is_open_24h">
            <UFormField
              :label="t('garages.form.openingTime')"
              name="opening_time"
              required
              :help="t('garages.form.hoursHelp')"
            >
              <UInput v-model="state.opening_time" type="time" dir="ltr" class="w-full" />
            </UFormField>
            <UFormField :label="t('garages.form.closingTime')" name="closing_time" required>
              <UInput v-model="state.closing_time" type="time" dir="ltr" class="w-full" />
            </UFormField>
          </template>
        </fieldset>

        <fieldset class="grid gap-3 sm:grid-cols-2">
          <legend class="mb-3 text-sm font-medium text-highlighted">
            {{ t('garages.form.sections.amenities') }}
          </legend>
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
        </fieldset>

        <template v-if="mode === 'create'">
          <fieldset class="space-y-3">
            <legend class="mb-1 text-sm font-medium text-highlighted">
              {{ t('garages.form.sections.levels') }}
            </legend>
            <p class="text-xs text-dimmed">
              {{ t('garages.form.levelsHelp', { max: MAX_SLOTS_PER_LEVEL }) }}
            </p>
            <ul class="space-y-3">
              <li
                v-for="(entry, index) in state.levels"
                :key="index"
                class="flex items-start gap-3"
                data-level-row
              >
                <UFormField
                  :label="t('garages.form.level')"
                  :name="`levels.${index}.level`"
                  class="w-28"
                >
                  <UInput
                    v-model="entry.level"
                    dir="ltr"
                    :maxlength="4"
                    class="w-full"
                    @blur="entry.level = normalizeLevel(entry.level)"
                  />
                </UFormField>
                <UFormField
                  :label="t('garages.form.slots')"
                  :name="`levels.${index}.slots`"
                  class="w-32"
                >
                  <UInput
                    v-model.optional="entry.slots"
                    type="number"
                    :min="1"
                    :max="MAX_SLOTS_PER_LEVEL"
                    dir="ltr"
                    class="w-full"
                  />
                </UFormField>
                <UButton
                  v-if="state.levels.length > 1"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-trash-2"
                  class="mt-6"
                  :aria-label="t('garages.form.removeLevel', { level: entry.level || index + 1 })"
                  @click="removeLevel(index)"
                />
              </li>
            </ul>
            <div class="flex flex-wrap items-center justify-between gap-2">
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                icon="i-lucide-plus"
                :disabled="state.levels.length >= MAX_LEVELS"
                @click="addLevel"
              >
                {{ t('garages.form.addLevel') }}
              </UButton>
              <p class="text-sm text-muted" aria-live="polite">
                {{ t('garages.form.totalSlots', { count: formatInteger(slotsTotal) }) }}
              </p>
            </div>
          </fieldset>

          <fieldset class="space-y-4">
            <legend class="mb-3 text-sm font-medium text-highlighted">
              {{ t('garages.form.sections.owner') }}
            </legend>
            <USwitch
              v-model="state.withOwner"
              :label="t('garages.form.withOwner')"
              :description="t('garages.form.withOwnerHelp')"
            />
            <div v-if="state.withOwner" class="grid gap-4 sm:grid-cols-2">
              <UFormField
                :label="t('garages.form.ownerName')"
                name="owner.name"
                required
                class="sm:col-span-2"
              >
                <UInput v-model="state.owner.name" autocomplete="off" class="w-full" />
              </UFormField>
              <UFormField :label="t('garages.form.ownerEmail')" name="owner.email" required>
                <UInput
                  v-model="state.owner.email"
                  type="email"
                  autocomplete="off"
                  dir="ltr"
                  class="w-full"
                />
              </UFormField>
              <UFormField :label="t('garages.form.ownerPhone')" name="owner.phone" required>
                <UInput
                  v-model="state.owner.phone"
                  type="tel"
                  autocomplete="off"
                  dir="ltr"
                  placeholder="+964 750 123 4567"
                  class="w-full"
                />
              </UFormField>
            </div>
          </fieldset>
        </template>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" :disabled="saving" @click="open = false">
          {{ t('garages.form.cancel') }}
        </UButton>
        <UButton
          type="submit"
          :form="FORM_ID"
          :loading="saving"
          :disabled="mode === 'edit' && !isDirty"
        >
          {{ mode === 'edit' ? t('garages.form.saveChanges') : t('garages.form.addSubmit') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
