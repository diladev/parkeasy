<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { formatMonthYear } from '@/shared/lib/format'

import { actionFor, initials, type UserAction } from '../model/user-actions'
import type { UserDetail } from '../model/user.schemas'
import UserStatusBadge from './UserStatusBadge.vue'

const {
  user,
  busy = false,
  resetting = false,
} = defineProps<{
  user: UserDetail
  /** A suspend/restore is running. */
  busy?: boolean
  /** A password reset is being sent. */
  resetting?: boolean
}>()
const emit = defineEmits<{ action: [action: UserAction]; reset: [] }>()

const { t, locale } = useI18n()

const action = computed(() => actionFor(user))
const ACTION_STYLE = {
  suspend: { color: 'error', variant: 'soft', icon: 'i-lucide-user-x' },
  restore: { color: 'neutral', variant: 'outline', icon: 'i-lucide-rotate-ccw' },
} as const
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-[12px] border border-default bg-muted p-4 sm:flex-row sm:items-center"
    :aria-label="user.name"
  >
    <div
      class="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-medium text-white"
      aria-hidden="true"
    >
      {{ initials(user.name) }}
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-lg font-medium text-highlighted" dir="auto">{{ user.name }}</h2>
        <UserStatusBadge :status="user.status" />
        <UBadge
          color="neutral"
          variant="outline"
          :label="t(`users.roles.${user.role}`)"
          class="rounded-[7px]"
        />
      </div>
      <p class="mt-1.5 flex flex-wrap gap-x-2 text-sm text-dimmed">
        <span dir="ltr">{{ user.email }}</span>
        <span aria-hidden="true">·</span>
        <span dir="ltr">{{ user.phone }}</span>
        <span aria-hidden="true">·</span>
        <span>{{
          t('users.detail.joined', { date: formatMonthYear(user.created_at, locale) })
        }}</span>
      </p>
    </div>

    <div class="flex shrink-0 flex-wrap gap-2 self-start sm:self-center">
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-key-round"
        :loading="resetting"
        :disabled="user.status !== 'active'"
        @click="emit('reset')"
      >
        {{ t('users.detail.actions.reset') }}
      </UButton>
      <UButton
        v-if="action"
        v-bind="ACTION_STYLE[action]"
        :loading="busy"
        @click="emit('action', action)"
      >
        {{ t(`users.detail.actions.${action}`) }}
      </UButton>
    </div>
  </section>
</template>
