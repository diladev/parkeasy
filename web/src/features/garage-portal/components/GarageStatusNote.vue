<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { OwnedGarage } from '../model/portal.schemas'

/** Why drivers can't find a garage that is pending or suspended. Nothing when approved. */
const { garage } = defineProps<{ garage: OwnedGarage }>()

const { t } = useI18n()
</script>

<template>
  <UAlert
    v-if="garage.status !== 'approved'"
    :color="garage.status === 'suspended' ? 'error' : 'warning'"
    variant="subtle"
    :icon="garage.status === 'suspended' ? 'i-lucide-ban' : 'i-lucide-hourglass'"
    :description="t(`garagePortal.status.${garage.status}`)"
  />
</template>
