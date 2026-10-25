<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSessionStore } from '@/features/auth'
import { isolate } from '@/shared/lib/bidi'

const { t } = useI18n()
const session = useSessionStore()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: isolate(session.user?.name ?? ''),
      description: isolate(session.user?.email ?? ''),
    },
  ],
  [
    {
      label: t('auth.signOut'),
      icon: 'i-lucide-log-out',
      // The app-wide logout listener (app/index.ts) takes the user to the sign-in page.
      onSelect: () => void session.logout(),
    },
  ],
])
</script>

<template>
  <UDropdownMenu :items :content="{ align: 'end' }">
    <UButton
      color="neutral"
      variant="ghost"
      class="rounded-full p-0"
      :aria-label="t('auth.accountMenu')"
    >
      <UAvatar
        :alt="session.user?.name"
        size="md"
        :ui="{ root: 'bg-(--ui-color-primary-700)', fallback: 'text-white' }"
      />
    </UButton>
  </UDropdownMenu>
</template>
