<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { createLoginFormSchema, type LoginFormValues } from '../model/auth.schemas'
import { authErrorMessage } from '../model/error-message'
import type { Portal } from '../model/permissions'
import { safeRedirect } from '../model/safe-redirect'
import { useSessionStore } from '../store/session.store'

/** The same sign-in page for both portals; the route passes which one. */
const { portal } = defineProps<{ portal: Portal }>()

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
const isPasswordReset = computed(() => route.query.reason === 'reset')

const texts = computed(() =>
  portal === 'garage'
    ? {
        heading: t('auth.login.garage.heading'),
        subtitle: t('auth.login.garage.subtitle'),
        footer: t('auth.login.garage.footer'),
      }
    : {
        heading: t('auth.login.heading'),
        subtitle: t('auth.login.subtitle'),
        footer: t('auth.login.footer'),
      },
)

async function onSubmit(event: FormSubmitEvent<LoginFormValues>) {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await session.login(event.data, portal)
    // /admin and /garage each open their portal's first page.
    const home = router.resolve(`/${portal}`).fullPath
    await router.replace(safeRedirect(router, route.query.redirect, home))
  } catch (error) {
    errorMessage.value = authErrorMessage(error, t)
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
      {{ texts.heading }}
    </h1>
    <p class="mt-1.5 text-center text-xs text-dimmed">{{ texts.subtitle }}</p>

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
      <UAlert
        v-else-if="isPasswordReset"
        color="success"
        variant="subtle"
        icon="i-lucide-circle-check"
        :description="t('auth.passwordReset')"
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
        <template #hint>
          <ULink
            :to="{ name: `${portal}.forgot` }"
            class="text-xs font-medium text-primary hover:underline"
          >
            {{ t('auth.login.forgot') }}
          </ULink>
        </template>
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

    <p class="mt-5 text-center text-xs text-dimmed">{{ texts.footer }}</p>
  </section>
</template>
