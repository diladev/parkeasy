<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useSessionStore } from '@/features/auth'
import { isolate } from '@/shared/lib/bidi'

const { t } = useI18n()
const session = useSessionStore()
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted">
      {{ t('overview.welcome', { name: isolate(session.user?.name ?? '') }) }}
    </p>

    <!-- Placeholder until the overview reports exist: no made-up numbers. -->
    <UEmpty
      icon="i-lucide-chart-column"
      :title="t('overview.comingSoonTitle')"
      :description="t('overview.comingSoonDescription')"
      variant="subtle"
      class="rounded-[12px] border border-default bg-muted"
    />
  </div>
</template>
