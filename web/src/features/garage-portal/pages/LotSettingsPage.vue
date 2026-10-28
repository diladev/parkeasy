<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import GaragePageFrame from '../components/GaragePageFrame.vue'
import GarageStatusNote from '../components/GarageStatusNote.vue'
import LotSettingsForm from '../components/LotSettingsForm.vue'
import { useGaragePage } from '../composables/useGaragePage'
import { useLotSettings } from '../composables/useLotSettings'

const { t } = useI18n()
const page = useGaragePage(useLotSettings)
</script>

<template>
  <div class="space-y-4">
    <GaragePageFrame
      :page
      :load-title="t('garagePortal.settings.loadError')"
      :loading-label="t('garagePortal.settings.loading')"
    >
      <template #default="{ data }">
        <GarageStatusNote :garage="data" />
        <!-- A fresh form per garage: switching garages never carries edits over. -->
        <LotSettingsForm :key="data.id" :settings="data" />
      </template>

      <template #loading>
        <div class="grid gap-4 xl:grid-cols-2">
          <USkeleton v-for="n in 4" :key="n" class="h-56 rounded-[12px]" />
        </div>
      </template>
    </GaragePageFrame>
  </div>
</template>
