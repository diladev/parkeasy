<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { formatInteger } from '@/shared/lib/format'

import type { Vehicle } from '../model/user.schemas'

const { vehicles } = defineProps<{ vehicles: Vehicle[] }>()

const { t } = useI18n()
</script>

<template>
  <section
    class="rounded-[12px] border border-default bg-muted p-4"
    aria-labelledby="vehicles-title"
  >
    <h2 id="vehicles-title" class="text-sm font-medium text-highlighted">
      {{ t('users.detail.vehicles.title') }}
    </h2>
    <p class="mt-1 text-xs text-dimmed">
      {{
        t('users.detail.vehicles.count', { count: formatInteger(vehicles.length) }, vehicles.length)
      }}
    </p>
    <ul v-if="vehicles.length" class="mt-3 divide-y divide-default">
      <li
        v-for="vehicle in vehicles"
        :key="vehicle.id"
        class="flex items-center justify-between gap-3 py-3"
      >
        <div class="min-w-0">
          <p class="text-sm text-highlighted">{{ vehicle.brand }} {{ vehicle.model }}</p>
          <!-- One text run: Vue drops the spaces between elements on separate lines. -->
          <p class="text-xs text-dimmed">
            {{ `${vehicle.color} · ${vehicle.year} · `
            }}<span dir="ltr" class="whitespace-nowrap">{{ vehicle.license_plate }}</span>
          </p>
        </div>
        <UBadge
          v-if="vehicle.is_default"
          color="neutral"
          variant="soft"
          :label="t('users.detail.vehicles.default')"
          class="rounded-[7px]"
        />
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-muted">{{ t('users.detail.vehicles.empty') }}</p>
  </section>
</template>
