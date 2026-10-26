<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { formatDateTime, formatInteger, formatMonthYear } from '@/shared/lib/format'
import { usePageTitle } from '@/shared/navigation/page-title'
import StatCard from '@/shared/ui/StatCard.vue'

import OwnedGaragesCard from '../components/OwnedGaragesCard.vue'
import SuspendUserDialog from '../components/SuspendUserDialog.vue'
import UserBookingsTable from '../components/UserBookingsTable.vue'
import UserHeaderCard from '../components/UserHeaderCard.vue'
import VehiclesCard from '../components/VehiclesCard.vue'
import WalletActivityCard from '../components/WalletActivityCard.vue'
import { usePasswordReset, useUserStatusChange } from '../composables/useUserActions'
import { useUser } from '../composables/useUser'
import type { UserAction } from '../model/user-actions'

const { id } = defineProps<{ id: number }>()

const { t, locale } = useI18n()
const query = useUser(() => id)
const statusChange = useUserStatusChange()
const passwordReset = usePasswordReset()

const user = computed(() => query.data.value)
// The heading and the browser tab show the person's name once it has loaded.
usePageTitle(() => user.value?.name)

const isNotFound = computed(
  () => query.error.value instanceof ApiError && query.error.value.kind === 'not-found',
)
const loadError = computed(() => {
  const error = query.error.value
  if (!error || user.value || isNotFound.value) return ''
  if (error instanceof ApiError && error.kind === 'network') return t('common.errors.network')
  return error instanceof ApiError && error.message ? error.message : t('common.errors.generic')
})

const iqd = (amount: number) => `${formatInteger(amount)} ${t('common.iqd')}`

const walletHint = computed(() => {
  const topUp = user.value?.stats.last_top_up
  return topUp
    ? t('users.detail.stats.lastTopUp', {
        amount: iqd(topUp.amount),
        date: formatDateTime(topUp.at, locale.value),
      })
    : t('users.detail.stats.noTopUps')
})

// ------------------------------------------------------------------ actions

const isConfirmOpen = ref(false)

function onAction(action: UserAction) {
  if (action === 'suspend') {
    isConfirmOpen.value = true
    return
  }
  run(action)
}

function run(action: UserAction) {
  if (!user.value) return
  statusChange.mutate(
    { id: user.value.id, action },
    { onSettled: () => (isConfirmOpen.value = false) },
  )
}

function sendReset() {
  if (user.value) passwordReset.mutate(user.value.id)
}
</script>

<template>
  <div class="space-y-6">
    <UEmpty
      v-if="isNotFound"
      icon="i-lucide-search-x"
      :title="t('users.detail.notFound.title')"
      :description="t('users.detail.notFound.description')"
      :actions="[
        {
          label: t('users.detail.notFound.back'),
          to: { name: 'admin.users' },
          color: 'neutral',
          variant: 'outline',
        },
      ]"
      class="rounded-[12px] border border-default bg-muted"
    />

    <UAlert
      v-else-if="loadError"
      role="alert"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :title="t('users.detail.loadError')"
      :description="loadError"
      :actions="[
        {
          label: t('common.retry'),
          color: 'neutral',
          variant: 'outline',
          onClick: () => void query.refetch(),
        },
      ]"
    />

    <template v-else-if="user">
      <UserHeaderCard
        :user
        :busy="statusChange.isPending.value && !isConfirmOpen"
        :resetting="passwordReset.isPending.value"
        @action="onAction"
        @reset="sendReset"
      />

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          :label="t('users.detail.stats.bookings')"
          :value="formatInteger(user.stats.bookings)"
          :hint="
            t('users.detail.stats.thisWeek', {
              count: formatInteger(user.stats.bookings_this_week),
            })
          "
        />
        <StatCard
          :label="t('users.detail.stats.wallet')"
          :value="iqd(user.stats.wallet_balance)"
          :hint="walletHint"
        />
        <StatCard
          :label="t('users.detail.stats.spent')"
          :value="iqd(user.stats.spent)"
          :hint="t('users.detail.stats.since', { date: formatMonthYear(user.created_at, locale) })"
        />
        <StatCard
          :label="t('users.detail.stats.cancelled')"
          :value="formatInteger(user.stats.cancelled)"
          :hint="
            user.stats.cancelled > 0
              ? t('users.detail.stats.cancelledHint')
              : t('users.detail.stats.noCancellations')
          "
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-[2fr_3fr]">
        <OwnedGaragesCard v-if="user.role === 'garage_owner'" :garages="user.garages" />
        <VehiclesCard v-else :vehicles="user.vehicles" />
        <WalletActivityCard :entries="user.wallet_activity" />
      </div>

      <UserBookingsTable :bookings="user.recent_bookings" />

      <SuspendUserDialog
        v-model:open="isConfirmOpen"
        :user-name="user.name"
        :busy="statusChange.isPending.value"
        @confirm="run('suspend')"
      />
    </template>

    <div v-else class="space-y-4" :aria-label="t('users.detail.loading')" role="status">
      <USkeleton class="h-24 w-full rounded-[12px]" />
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <USkeleton v-for="n in 4" :key="n" class="h-28 rounded-[12px]" />
      </div>
      <USkeleton class="h-64 w-full rounded-[12px]" />
    </div>
  </div>
</template>
