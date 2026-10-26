<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { occupancyColor, parseLevel, percent } from '../model/garage-figures'
import type { LevelOccupancy } from '../model/garage.schemas'

const { levels } = defineProps<{ levels: LevelOccupancy[] }>()

const { t } = useI18n()

function levelLabel(level: string): string {
  const parsed = parseLevel(level)
  switch (parsed.kind) {
    case 'ground':
      return t('garages.detail.levels.ground')
    case 'basement':
      return t('garages.detail.levels.basement', { number: parsed.number })
    case 'floor':
      return t('garages.detail.levels.floor', { number: parsed.number })
    case 'other':
      return parsed.name
  }
}
</script>

<template>
  <section class="rounded-[12px] border border-default bg-muted p-4" aria-labelledby="levels-title">
    <h2 id="levels-title" class="text-sm font-medium text-highlighted">
      {{ t('garages.detail.levels.title') }}
    </h2>

    <ul v-if="levels.length > 0" class="mt-4 space-y-4">
      <li v-for="level in levels" :key="level.level">
        <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
          <span class="text-highlighted">
            {{ levelLabel(level.level) }}
            <span class="text-dimmed" dir="ltr">({{ level.level }})</span>
          </span>
          <span class="text-muted">
            {{ t('garages.detail.levels.taken', { taken: level.taken, total: level.total }) }}
            · <span dir="ltr">{{ percent(level.taken, level.total) }}%</span>
          </span>
        </div>
        <UProgress
          :model-value="percent(level.taken, level.total)"
          :color="occupancyColor(percent(level.taken, level.total))"
          size="sm"
          :aria-label="levelLabel(level.level)"
        />
      </li>
    </ul>
    <p v-else class="mt-4 text-sm text-muted">{{ t('garages.detail.levels.empty') }}</p>
  </section>
</template>
