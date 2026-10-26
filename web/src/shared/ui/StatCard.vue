<script setup lang="ts">
const {
  label,
  value,
  hint = '',
  tone = 'muted',
} = defineProps<{
  label: string
  value: string
  hint?: string
  /** Colour of the hint line; `up`/`down` also show an arrow. */
  tone?: 'muted' | 'up' | 'down'
}>()
</script>

<template>
  <div class="rounded-[12px] border border-default bg-muted p-4">
    <p class="text-xs font-medium uppercase text-dimmed">{{ label }}</p>
    <p class="mt-2 text-2xl font-medium text-highlighted">{{ value }}</p>
    <p
      v-if="hint"
      class="mt-2 flex items-center gap-1 text-xs"
      :class="{
        'text-muted': tone === 'muted',
        'text-success': tone === 'up',
        'text-error': tone === 'down',
      }"
    >
      <UIcon
        v-if="tone !== 'muted'"
        :name="tone === 'up' ? 'i-lucide-trending-up' : 'i-lucide-trending-down'"
        class="size-3.5"
        aria-hidden="true"
      />
      {{ hint }}
    </p>
  </div>
</template>
