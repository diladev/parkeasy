<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { isolate } from '@/shared/lib/bidi'
import { formatInteger } from '@/shared/lib/format'

import { WALK_IN_PAYMENT_METHODS, type WalkInPaymentMethod } from '../model/portal.schemas'

/**
 * Confirms ending a walk-in (with how it paid) or removing one entered by
 * mistake. Nuxt UI's modal traps focus, closes on Escape and returns focus.
 */
const {
  mode,
  plate,
  amount,
  pricePerHour,
  busy = false,
} = defineProps<{
  mode: 'end' | 'remove'
  plate: string
  /** The fee if it leaves now. */
  amount: number
  pricePerHour: number
  busy?: boolean
}>()
const emit = defineEmits<{ end: [method: WalkInPaymentMethod]; remove: [] }>()
const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const method = ref<WalkInPaymentMethod>('cash')
watch(open, (isOpen) => {
  if (isOpen) method.value = 'cash'
})

const iqd = (value: number) => `${formatInteger(value)} ${t('common.iqd')}`
const methods = computed(() =>
  WALK_IN_PAYMENT_METHODS.map((value) => ({
    value,
    label: t(`garagePortal.slots.walkIn.${value}`),
  })),
)
</script>

<template>
  <UModal
    v-model:open="open"
    :title="
      mode === 'end'
        ? t('garagePortal.slots.walkIn.endTitle', { plate: isolate(plate) })
        : t('garagePortal.slots.walkIn.removeTitle', { plate: isolate(plate) })
    "
    :description="
      mode === 'end'
        ? t('garagePortal.slots.walkIn.endDescription', { price: iqd(pricePerHour) })
        : t('garagePortal.slots.walkIn.removeDescription')
    "
    :dismissible="!busy"
  >
    <template v-if="mode === 'end'" #body>
      <p class="flex items-baseline justify-between gap-4">
        <span class="text-sm text-muted">{{ t('garagePortal.slots.walkIn.toPay') }}</span>
        <span class="text-2xl font-medium text-highlighted" data-walk-in-amount>{{
          iqd(amount)
        }}</span>
      </p>
      <URadioGroup
        v-model="method"
        :items="methods"
        :legend="t('garagePortal.slots.walkIn.paidBy')"
        orientation="horizontal"
        class="mt-4"
      />
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" :disabled="busy" @click="open = false">
          {{ t('garagePortal.slots.walkIn.cancel') }}
        </UButton>
        <UButton v-if="mode === 'end'" :loading="busy" @click="emit('end', method)">
          {{ t('garagePortal.slots.walkIn.confirmEnd', { amount: iqd(amount) }) }}
        </UButton>
        <UButton v-else color="error" :loading="busy" @click="emit('remove')">
          {{ t('garagePortal.slots.walkIn.confirmRemove') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
