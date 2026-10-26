<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import type { UserStatus } from '../model/user.schemas'

const { status } = defineProps<{ status: UserStatus }>()

const { t } = useI18n()

// The text says the status too, so it never depends on colour alone.
const COLOR = { active: 'success', suspended: 'error', inactive: 'neutral' } as const
</script>

<template>
  <UBadge
    :color="COLOR[status]"
    variant="soft"
    :label="t(`users.status.${status}`)"
    class="rounded-[7px]"
  />
</template>
