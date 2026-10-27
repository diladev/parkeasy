<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useSessionStore } from '@/features/auth'

import { activePortal, PORTALS } from '../router/portal'

const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()

/** The sign-in page of the portal that refused, e.g. an owner who opened /admin. */
async function signInAgain() {
  if (session.isAuthenticated) await session.logout()
  await router.replace({ name: PORTALS[activePortal.value].login })
}
</script>

<template>
  <section class="w-full max-w-md text-center" aria-labelledby="forbidden-heading">
    <UIcon name="i-lucide-shield-x" class="size-10 text-dimmed" aria-hidden="true" />
    <h1 id="forbidden-heading" class="mt-4 text-xl font-medium text-highlighted">
      {{ t('errors.forbidden.title') }}
    </h1>
    <p class="mt-2 text-sm text-muted">{{ t('errors.forbidden.description') }}</p>
    <UButton class="mt-6" @click="signInAgain">{{ t('auth.signInAgain') }}</UButton>
  </section>
</template>
