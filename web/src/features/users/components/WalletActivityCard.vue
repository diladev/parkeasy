<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { isolate } from '@/shared/lib/bidi'
import { formatDateTime, formatInteger } from '@/shared/lib/format'

import type { WalletEntry } from '../model/user.schemas'

const { entries } = defineProps<{ entries: WalletEntry[] }>()

const { t, locale } = useI18n()

/** "Booking · City Center Parking", "Top-up" */
function describe(entry: WalletEntry): string {
  const kind = t(`users.detail.wallet.category.${entry.category}`)
  return entry.garage ? `${kind} · ${isolate(entry.garage)}` : kind
}
</script>

<template>
  <section class="rounded-[12px] border border-default bg-muted p-4" aria-labelledby="wallet-title">
    <h2 id="wallet-title" class="text-sm font-medium text-highlighted">
      {{ t('users.detail.wallet.title') }}
    </h2>
    <p class="mt-1 text-xs text-dimmed">{{ t('users.detail.wallet.subtitle') }}</p>
    <ul v-if="entries.length" class="mt-3 divide-y divide-default">
      <li
        v-for="entry in entries"
        :key="entry.id"
        class="flex items-center justify-between gap-3 py-2.5"
      >
        <div class="min-w-0">
          <p class="text-sm text-highlighted">{{ describe(entry) }}</p>
          <p class="text-xs text-dimmed">{{ formatDateTime(entry.at, locale) }}</p>
        </div>
        <!-- Sign and amount stay together, left to right, in both languages. -->
        <span
          dir="ltr"
          class="text-sm font-medium whitespace-nowrap"
          :class="entry.type === 'credit' ? 'text-success' : 'text-highlighted'"
        >
          {{ entry.type === 'credit' ? '+' : '−' }}{{ formatInteger(entry.amount) }}
          {{ t('common.iqd') }}
        </span>
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-muted">{{ t('users.detail.wallet.empty') }}</p>
  </section>
</template>
