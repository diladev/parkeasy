<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import LocaleSwitch from './parts/LocaleSwitch.vue'

const { t } = useI18n()
const route = useRoute()

/** The Garage Portal's sign-in pages open with its teal panel (Figma G01); wide screens only. */
const showGaragePanel = computed(() => route.matched.some((r) => r.meta.portal === 'garage'))
const year = new Date().getFullYear()

const points = computed(() => [
  { icon: 'i-lucide-activity', text: t('auth.brand.live') },
  { icon: 'i-lucide-chart-column', text: t('auth.brand.revenue') },
  { icon: 'i-lucide-sliders-horizontal', text: t('auth.brand.manage') },
])
</script>

<template>
  <div class="flex min-h-dvh bg-default">
    <a href="#main" class="skip-link">{{ t('app.skipToContent') }}</a>

    <aside
      v-if="showGaragePanel"
      class="hidden w-[42%] max-w-[560px] shrink-0 flex-col justify-between bg-(--ui-color-primary-700) p-12 text-white lg:flex"
    >
      <div class="flex items-center gap-2.5">
        <span
          class="flex size-9 items-center justify-center rounded-[10px] bg-white text-xl font-bold text-(--ui-color-primary-700)"
          aria-hidden="true"
          >P</span
        >
        <span class="text-sm font-semibold">{{ t('app.name') }}</span>
      </div>

      <div>
        <p class="text-3xl font-semibold">{{ t('auth.brand.title') }}</p>
        <ul class="mt-8 space-y-4">
          <li v-for="point in points" :key="point.icon" class="flex items-center gap-3 text-sm">
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-[8px] bg-white/15"
              aria-hidden="true"
            >
              <UIcon :name="point.icon" class="size-4" />
            </span>
            {{ point.text }}
          </li>
        </ul>
      </div>

      <p class="text-xs text-white/80">{{ t('auth.brand.copyright', { year }) }}</p>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex justify-end p-4">
        <LocaleSwitch />
      </header>
      <main
        id="main"
        tabindex="-1"
        class="flex flex-1 items-center justify-center px-4 pb-16 outline-none"
      >
        <RouterView />
      </main>
    </div>
  </div>
</template>
