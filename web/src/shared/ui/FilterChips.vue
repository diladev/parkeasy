<script setup lang="ts" generic="T extends string">
import { formatInteger } from '@/shared/lib/format'

/**
 * A row of toggle buttons for one list filter ("All · 8", "Pending · 2"...).
 * `value: undefined` is the "everything" option.
 */
const { options, label } = defineProps<{
  options: { value: T | undefined; label: string; count?: number }[]
  /** Read out by screen readers for the whole group. */
  label: string
}>()
const model = defineModel<T | undefined>()
</script>

<template>
  <div role="group" :aria-label="label" class="flex flex-wrap gap-2">
    <UButton
      v-for="option in options"
      :key="option.value ?? 'all'"
      :color="model === option.value ? 'primary' : 'neutral'"
      :variant="model === option.value ? 'soft' : 'outline'"
      size="sm"
      class="rounded-full px-3.5"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{
        option.count === undefined
          ? option.label
          : `${option.label} · ${formatInteger(option.count)}`
      }}
    </UButton>
  </div>
</template>
