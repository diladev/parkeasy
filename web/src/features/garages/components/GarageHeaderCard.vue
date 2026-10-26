<script setup lang="ts">
import { computed } from 'vue'
import { I18nT, useI18n } from 'vue-i18n'

import { isolate } from '@/shared/lib/bidi'
import { formatMonthYear } from '@/shared/lib/format'

import { ACTION_FOR_STATUS, type GarageAction } from '../model/garage-actions'
import type { GarageDetail } from '../model/garage.schemas'
import GarageStatusBadge from './GarageStatusBadge.vue'

const { garage, busy = false } = defineProps<{ garage: GarageDetail; busy?: boolean }>()
const emit = defineEmits<{ action: [action: GarageAction]; edit: [] }>()

const { t, locale } = useI18n()

/** "City Center Parking" -> "CC" */
const initials = computed(() =>
  garage.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join(''),
)

const action = computed(() => ACTION_FOR_STATUS[garage.status])

const ACTION_STYLE = {
  approve: { color: 'success', variant: 'solid', icon: 'i-lucide-check' },
  suspend: { color: 'error', variant: 'soft', icon: 'i-lucide-pause' },
  restore: { color: 'neutral', variant: 'outline', icon: 'i-lucide-rotate-ccw' },
} as const
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-[12px] border border-default bg-muted p-4 sm:flex-row sm:items-center"
    :aria-label="garage.name"
  >
    <div
      class="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-success/15 text-lg font-medium text-success"
      aria-hidden="true"
    >
      {{ initials }}
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-lg font-medium text-highlighted">{{ garage.name }}</h2>
        <GarageStatusBadge :status="garage.status" />
      </div>
      <p class="mt-1.5 text-sm text-dimmed">
        <span>{{ garage.address }}</span>
        <span aria-hidden="true"> · </span>
        <!-- The owner's name opens their page under Users. -->
        <I18nT v-if="garage.owner" keypath="garages.detail.owner" tag="span" scope="global">
          <template #name>
            <ULink
              :to="{ name: 'admin.users.detail', params: { id: garage.owner.id } }"
              class="text-default hover:underline"
              >{{ isolate(garage.owner.name) }}</ULink
            >
          </template>
          <template #email>{{ isolate(garage.owner.email) }}</template>
        </I18nT>
        <span v-else>{{ t('garages.noOwner') }}</span>
        <span aria-hidden="true"> · </span>
        <span>{{
          t('garages.detail.added', { date: formatMonthYear(garage.created_at, locale) })
        }}</span>
      </p>
    </div>

    <div class="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
      <UButton color="neutral" variant="outline" icon="i-lucide-pencil" @click="emit('edit')">
        {{ t('garages.form.editButton') }}
      </UButton>
      <UButton v-bind="ACTION_STYLE[action]" :loading="busy" @click="emit('action', action)">
        {{ t(`garages.detail.actions.${action}`) }}
      </UButton>
    </div>
  </section>
</template>
