<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { ApiError } from '@/shared/api/errors'

import { createLoginFormSchema, type LoginFormValues } from '../model/auth.schemas'
import { safeRedirect } from '../model/safe-redirect'
import { useSessionStore } from '../store/session.store'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const schema = computed(() =>
  createLoginFormSchema({
    emailInvalid: t('auth.errors.emailInvalid'),
    passwordRequired: t('auth.errors.passwordRequired'),
  }),
)
const state = reactive<LoginFormValues>({ email: '', password: '' })
const isPasswordVisible = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const isSessionExpired = computed(() => route.query.reason === 'expired')

/** The server's message is already translated (x-lang); 5xx and network errors get ours. */
function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network') return t('auth.errors.network')
    if (error.message !== '') return error.message
  }
  return t('auth.errors.generic')
}

async function onSubmit(event: FormSubmitEvent<LoginFormValues>) {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await session.login(event.data, 'admin')
    const home = router.resolve({ name: 'admin.overview' }).fullPath
    await router.replace(safeRedirect(router, route.query.redirect, home))
  } catch (error) {
    errorMessage.value = messageFor(error)
    state.password = ''
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section
    class="w-full max-w-[420px] rounded-[18px] border border-default bg-muted px-6 py-9 sm:px-9"
    aria-labelledby="login-heading"
  >
    <div
      class="mx-auto flex size-14 items-center justify-center rounded-[16px] bg-primary text-[32px] font-bold text-white"
      aria-hidden="true"
    >
      P
    </div>
    <h1 id="login-heading" class="mt-5 text-center text-lg font-medium text-highlighted">
      {{ t('auth.login.heading') }}
    </h1>
    <p class="mt-1.5 text-center text-xs text-dimmed">{{ t('auth.login.subtitle') }}</p>

    <!-- Announced by screen readers as soon as it appears. -->
    <div role="alert" class="mt-6 empty:hidden">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="errorMessage"
      />
      <UAlert
        v-else-if="isSessionExpired"
        color="warning"
        variant="subtle"
        icon="i-lucide-clock"
        :description="t('auth.sessionExpired')"
      />
    </div>

    <UForm :schema :state class="mt-6 space-y-4" @submit="onSubmit">
      <UFormField :label="t('auth.login.email')" name="email">
        <UInput
          v-model="state.email"
          type="email"
          autocomplete="username"
          dir="ltr"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <UFormField :label="t('auth.login.password')" name="password">
        <UInput
          v-model="state.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="current-password"
          size="lg"
          class="w-full"
          :ui="{ trailing: 'pe-1' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              :icon="isPasswordVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :aria-label="
                isPasswordVisible ? t('auth.login.hidePassword') : t('auth.login.showPassword')
              "
              :aria-pressed="isPasswordVisible"
              @click="isPasswordVisible = !isPasswordVisible"
            />
          </template>
        </UInput>
      </UFormField>

      <UButton type="submit" block size="lg" class="mt-2" :loading="isSubmitting">
        {{ t('auth.login.submit') }}
      </UButton>
    </UForm>

    <p class="mt-5 text-center text-xs text-dimmed">{{ t('auth.login.footer') }}</p>
  </section>
</template>
