<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatInteger, formatWeekday } from '@/shared/lib/format'
import { formatCompact, niceCeiling } from '@/shared/lib/numbers'

export interface RevenueDay {
  /** An Iraq calendar day, "2026-10-27". */
  date: string
  /** Whole dinars. */
  amount: number
}

/**
 * Revenue per day as columns. One series, so one colour and no legend: the
 * title names it. Columns grow from one baseline; the exact amount is in the
 * tooltip (hover or keyboard focus) and in a table for screen readers.
 */
const { days, title } = defineProps<{ days: RevenueDay[]; title: string }>()

const { t, locale } = useI18n()
const headingId = useId()

const total = computed(() => days.reduce((sum, day) => sum + day.amount, 0))
const top = computed(() => niceCeiling(Math.max(...days.map((day) => day.amount), 0)))
const ticks = computed(() => (top.value > 0 ? [top.value, top.value / 2, 0] : [0]))

const iqd = (amount: number) => `${formatInteger(amount)} ${t('common.iqd')}`
const heightOf = (amount: number) => (top.value > 0 ? `${(amount / top.value) * 100}%` : '0%')
const labelOf = (day: RevenueDay) => `${formatWeekday(day.date, locale.value)}: ${iqd(day.amount)}`
</script>

<template>
  <section
    class="flex flex-col rounded-[12px] border border-default bg-muted p-4"
    :aria-labelledby="headingId"
  >
    <h2 :id="headingId" class="text-sm font-medium text-highlighted">{{ title }}</h2>
    <p class="mt-1 text-xs text-dimmed">
      {{ t('charts.revenueTotal', { amount: iqd(total) }) }}
    </p>

    <!-- The plot: a recessive grid, then the columns on top. -->
    <div class="mt-5 flex flex-1 gap-3">
      <div
        class="flex h-40 flex-col justify-between text-end text-[11px] text-dimmed"
        aria-hidden="true"
        dir="ltr"
      >
        <span v-for="tick in ticks" :key="tick" class="leading-none">{{
          formatCompact(tick)
        }}</span>
      </div>
      <div class="flex min-w-0 flex-1 flex-col">
        <div class="relative h-40">
          <div class="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            <div
              v-for="tick in ticks"
              :key="tick"
              class="border-t"
              :class="tick === 0 ? 'border-accented' : 'border-default'"
            />
          </div>
          <ul class="relative flex h-full items-end" :aria-label="title">
            <li v-for="day in days" :key="day.date" class="flex h-full flex-1 justify-center">
              <UTooltip :text="labelOf(day)" :content="{ side: 'top' }">
                <!-- The hit area is the whole day, not just the column. -->
                <div
                  role="img"
                  tabindex="0"
                  :aria-label="labelOf(day)"
                  class="group flex h-full w-full items-end justify-center rounded-[6px] px-2 outline-none hover:bg-elevated/60 focus-visible:ring-2 focus-visible:ring-primary"
                  data-revenue-day
                >
                  <div
                    class="w-full max-w-6 rounded-t-[4px] bg-primary transition-opacity group-hover:opacity-90"
                    :style="{ height: heightOf(day.amount) }"
                  />
                </div>
              </UTooltip>
            </li>
          </ul>
        </div>
        <div class="mt-2 flex text-xs text-dimmed" aria-hidden="true">
          <span v-for="day in days" :key="day.date" class="min-w-0 flex-1 truncate text-center">
            {{ formatWeekday(day.date, locale) }}
          </span>
        </div>
      </div>
    </div>

    <!-- The same figures as a table, for screen readers. -->
    <table class="sr-only">
      <caption>
        {{
          title
        }}
      </caption>
      <thead>
        <tr>
          <th scope="col">{{ t('charts.day') }}</th>
          <th scope="col">{{ t('charts.revenue') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in days" :key="day.date">
          <th scope="row">{{ formatWeekday(day.date, locale) }} ({{ day.date }})</th>
          <td>{{ iqd(day.amount) }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
