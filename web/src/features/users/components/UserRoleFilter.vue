<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import FilterChips from '@/shared/ui/FilterChips.vue'

import { ROLES, type Role, type UserCounts } from '../model/user.schemas'

const { counts } = defineProps<{ counts: UserCounts | undefined }>()
/** undefined = every role. */
const role = defineModel<Role | undefined>('role')

const { t } = useI18n()

const options = computed(() =>
  [undefined, ...ROLES].map((value) => ({
    value,
    label: t(`users.filters.${value ?? 'all'}`),
    count: counts?.[value ?? 'all'],
  })),
)
</script>

<template>
  <FilterChips v-model="role" :options :label="t('users.filterLabel')" />
</template>
