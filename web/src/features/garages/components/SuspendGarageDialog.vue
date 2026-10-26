<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { isolate } from '@/shared/lib/bidi'

const { garageName, busy = false } = defineProps<{ garageName: string; busy?: boolean }>()
const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
</script>

<template>
  <!-- Nuxt UI's modal traps focus, closes on Escape and returns focus afterwards. -->
  <UModal
    v-model:open="open"
    :title="t('garages.suspendDialog.title', { name: isolate(garageName) })"
    :description="t('garages.suspendDialog.description')"
    :dismissible="!busy"
  >
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" :disabled="busy" @click="open = false">
          {{ t('garages.suspendDialog.cancel') }}
        </UButton>
        <UButton color="error" :loading="busy" @click="emit('confirm')">
          {{ t('garages.suspendDialog.confirm') }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
