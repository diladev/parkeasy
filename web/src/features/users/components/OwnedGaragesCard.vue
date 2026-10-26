<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { OwnedGarage } from '../model/user.schemas'

const { garages } = defineProps<{ garages: OwnedGarage[] }>()

const { t } = useI18n()

const COLOR = { approved: 'success', pending: 'warning', suspended: 'error' } as const
</script>

<template>
  <section
    class="rounded-[12px] border border-default bg-muted p-4"
    aria-labelledby="garages-title"
  >
    <h2 id="garages-title" class="text-sm font-medium text-highlighted">
      {{ t('users.detail.garages.title') }}
    </h2>
    <ul v-if="garages.length" class="mt-3 divide-y divide-default">
      <li
        v-for="garage in garages"
        :key="garage.id"
        class="flex items-center justify-between gap-3 py-3"
      >
        <div class="min-w-0">
          <ULink
            :to="{ name: 'admin.garages.detail', params: { id: garage.id } }"
            class="text-sm text-highlighted hover:underline"
            >{{ garage.name }}</ULink
          >
          <p class="text-xs text-dimmed">{{ garage.city }}</p>
        </div>
        <UBadge
          :color="COLOR[garage.status]"
          variant="soft"
          :label="t(`garages.status.${garage.status}`)"
          class="rounded-[7px]"
        />
      </li>
    </ul>
    <p v-else class="mt-3 text-sm text-muted">{{ t('users.detail.garages.empty') }}</p>
  </section>
</template>
