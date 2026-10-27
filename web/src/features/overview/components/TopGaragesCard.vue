<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { formatInteger } from '@/shared/lib/format'

import type { TopGarage } from '../model/overview.schemas'

const { garages } = defineProps<{ garages: TopGarage[] }>()

const { t } = useI18n()
</script>

<template>
  <section
    class="rounded-[12px] border border-default bg-muted p-4"
    aria-labelledby="top-garages-title"
  >
    <h2 id="top-garages-title" class="text-sm font-medium text-highlighted">
      {{ t('overview.topGarages.title') }}
    </h2>
    <ol v-if="garages.length" class="mt-3 divide-y divide-default">
      <li
        v-for="(garage, index) in garages"
        :key="garage.id"
        class="flex items-center gap-3 py-2.5"
      >
        <span class="w-5 shrink-0 text-sm text-dimmed" aria-hidden="true">{{ index + 1 }}.</span>
        <div class="min-w-0 flex-1">
          <ULink
            :to="{ name: 'admin.garages.detail', params: { id: garage.id } }"
            class="block truncate text-sm text-highlighted hover:underline"
            >{{ garage.name }}</ULink
          >
          <p class="text-xs text-dimmed">{{ garage.city }}</p>
        </div>
        <span class="text-sm font-medium whitespace-nowrap text-highlighted">
          {{ formatInteger(garage.revenue) }} {{ t('common.iqd') }}
        </span>
      </li>
    </ol>
    <p v-else class="mt-3 text-sm text-muted">{{ t('overview.topGarages.empty') }}</p>
  </section>
</template>
