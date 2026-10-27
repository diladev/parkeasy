<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { levelLabel } from '@/shared/lib/level-label'
import { occupancyColor, percent } from '@/shared/lib/levels'

export interface LevelOccupancy {
  level: string
  total: number
  taken: number
}

/** How full each level is right now, top floor first (the API's order). */
const { levels } = defineProps<{ levels: LevelOccupancy[] }>()

const { t } = useI18n()
const headingId = useId()
const label = (level: string) => levelLabel(level, t)
</script>

<template>
  <section class="rounded-[12px] border border-default bg-muted p-4" :aria-labelledby="headingId">
    <h2 :id="headingId" class="text-sm font-medium text-highlighted">
      {{ t('levels.title') }}
    </h2>

    <ul v-if="levels.length > 0" class="mt-4 space-y-4">
      <li v-for="level in levels" :key="level.level">
        <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
          <span class="text-highlighted">
            {{ label(level.level) }}
            <span class="text-dimmed" dir="ltr">({{ level.level }})</span>
          </span>
          <span class="text-muted">
            {{ t('levels.taken', { taken: level.taken, total: level.total }) }}
            · <span dir="ltr">{{ percent(level.taken, level.total) }}%</span>
          </span>
        </div>
        <UProgress
          :model-value="percent(level.taken, level.total)"
          :color="occupancyColor(percent(level.taken, level.total))"
          size="sm"
          :aria-label="label(level.level)"
        />
      </li>
    </ul>
    <p v-else class="mt-4 text-sm text-muted">{{ t('levels.empty') }}</p>
  </section>
</template>
