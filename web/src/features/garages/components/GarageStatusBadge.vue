<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { GarageStatus } from '../model/garage.schemas'

const { status } = defineProps<{ status: GarageStatus }>()

const { t } = useI18n()

// The text says the status too, so it never depends on colour alone.
const COLOR = { approved: 'success', pending: 'warning', suspended: 'error' } as const
</script>

<template>
  <UBadge
    :color="COLOR[status]"
    variant="soft"
    :label="t(`garages.status.${status}`)"
    class="rounded-[7px]"
  />
</template>
