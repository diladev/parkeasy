<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { computed, nextTick, reactive, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { isolate } from '@/shared/lib/bidi'

import { authApi } from '../api/auth.api'
import {
  createNewPasswordSchema,
  createResetCodeSchema,
  createResetEmailSchema,
  PASSWORD_MIN_LENGTH,
  type NewPasswordValues,
  type ResetCodeValues,
  type ResetEmailValues,
} from '../model/auth.schemas'
import { authErrorMessage } from '../model/error-message'
import type { Portal } from '../model/permissions'

/**
 * Forgot password in three short steps: email, the emailed code, a new
 * password. The reset token from step 2 stays in memory only: never in the
 * URL or in storage.
 */
const { portal } = defineProps<{ portal: Portal }>()

const { t } = useI18n()
const router = useRouter()

const STEPS = ['email', 'code', 'password'] as const
type Step = (typeof STEPS)[number]

const step = ref<Step>('email')
const stepNumber = computed(() => STEPS.indexOf(step.value) + 1)

/** The address the code went to. */
const email = ref('')
const token = ref('')

const emailState = reactive<ResetEmailValues>({ email: '' })
const codeState = reactive<ResetCodeValues>({ code: '' })
const passwordState = reactive<NewPasswordValues>({ password: '', confirm: '' })
const isPasswordVisible = ref(false)

const isBusy = ref(false)
const errorMessage = ref('')
const infoMessage = ref('')

const emailSchema = computed(() =>
  createResetEmailSchema({ emailInvalid: t('auth.errors.emailInvalid') }),
)
const codeSchema = computed(() => createResetCodeSchema({ code: t('auth.forgot.errors.code') }))
const passwordSchema = computed(() =>
  createNewPasswordSchema({
    tooShort: t('auth.forgot.errors.passwordShort', { min: PASSWORD_MIN_LENGTH }),
    mismatch: t('auth.forgot.errors.mismatch'),
  }),
)

const texts = computed(() => {
  if (step.value === 'code') {
    return {
      heading: t('auth.forgot.code.heading'),
      description: t('auth.forgot.code.description', { email: isolate(email.value) }),
    }
  }
  return {
    heading: t(`auth.forgot.${step.value}.heading`),
    description: t(`auth.forgot.${step.value}.description`),
  }
})

// A new step replaces the form under the keyboard: move focus to its heading,
// so screen readers announce it and Tab starts from the top.
const headingRef = useTemplateRef<HTMLElement>('heading')
async function goTo(next: Step) {
  step.value = next
  await nextTick()
  headingRef.value?.focus()
}

async function run(task: () => Promise<void>) {
  errorMessage.value = ''
  isBusy.value = true
  try {
    await task()
  } catch (error) {
    errorMessage.value = authErrorMessage(error, t)
  } finally {
    isBusy.value = false
  }
}

function onEmail(event: FormSubmitEvent<ResetEmailValues>) {
  void run(async () => {
    const { message } = await authApi.forgotPassword(event.data.email)
    email.value = event.data.email
    infoMessage.value = message
    codeState.code = ''
    await goTo('code')
  })
}

function onResend() {
  void run(async () => {
    await authApi.forgotPassword(email.value)
    infoMessage.value = t('auth.forgot.code.resent')
  })
}

function onCode(event: FormSubmitEvent<ResetCodeValues>) {
  void run(async () => {
    const result = await authApi.verifyOtp(email.value, event.data.code)
    token.value = result.token
    infoMessage.value = ''
    await goTo('password')
  })
}

function onPassword(event: FormSubmitEvent<NewPasswordValues>) {
  void run(async () => {
    await authApi.resetPassword(token.value, event.data.password)
    token.value = ''
    await router.replace({ name: `${portal}.login`, query: { reason: 'reset' } })
  })
}

function startAgain() {
  token.value = ''
  errorMessage.value = ''
  infoMessage.value = ''
  codeState.code = ''
  passwordState.password = ''
  passwordState.confirm = ''
  void goTo('email')
}
</script>

<template>
  <section
    class="w-full max-w-[420px] rounded-[18px] border border-default bg-muted px-6 py-9 sm:px-9"
    aria-labelledby="forgot-heading"
  >
    <p class="text-xs font-medium text-dimmed">
      {{ t('auth.forgot.stepOf', { step: stepNumber, total: STEPS.length }) }}
    </p>
    <div class="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
      <span
        v-for="n in STEPS.length"
        :key="n"
        class="h-1 rounded-full"
        :class="n <= stepNumber ? 'bg-primary' : 'bg-accented'"
      />
    </div>

    <h1
      id="forgot-heading"
      ref="heading"
      tabindex="-1"
      class="mt-6 text-lg font-medium text-highlighted outline-none"
    >
      {{ texts.heading }}
    </h1>
    <p class="mt-1.5 text-sm text-muted">{{ texts.description }}</p>

    <!-- Announced by screen readers as soon as they appear. -->
    <div role="alert" class="mt-5 empty:hidden">
      <UAlert
        v-if="errorMessage"
        color="error"
        variant="subtle"
        icon="i-lucide-circle-alert"
        :description="errorMessage"
      />
    </div>
    <div role="status" class="mt-5 empty:hidden">
      <UAlert
        v-if="infoMessage && !errorMessage"
        color="neutral"
        variant="subtle"
        icon="i-lucide-mail"
        :description="infoMessage"
      />
    </div>

    <UForm
      v-if="step === 'email'"
      key="email"
      :schema="emailSchema"
      :state="emailState"
      class="mt-6 space-y-4"
      @submit="onEmail"
    >
      <UFormField :label="t('auth.login.email')" name="email">
        <UInput
          v-model="emailState.email"
          type="email"
          autocomplete="username"
          dir="ltr"
          size="lg"
          class="w-full"
        />
      </UFormField>
      <UButton type="submit" block size="lg" :loading="isBusy">
        {{ t('auth.forgot.email.submit') }}
      </UButton>
    </UForm>

    <UForm
      v-else-if="step === 'code'"
      key="code"
      :schema="codeSchema"
      :state="codeState"
      class="mt-6 space-y-4"
      @submit="onCode"
    >
      <UFormField :label="t('auth.forgot.code.label')" name="code">
        <UInput
          v-model="codeState.code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="7"
          dir="ltr"
          size="lg"
          class="w-full"
          :ui="{ base: 'tracking-[0.3em]' }"
        />
      </UFormField>
      <UButton type="submit" block size="lg" :loading="isBusy">
        {{ t('auth.forgot.code.submit') }}
      </UButton>
      <div class="flex flex-wrap justify-between gap-2">
        <UButton variant="link" color="neutral" size="sm" :disabled="isBusy" @click="onResend">
          {{ t('auth.forgot.code.resend') }}
        </UButton>
        <UButton variant="link" color="neutral" size="sm" :disabled="isBusy" @click="startAgain">
          {{ t('auth.forgot.code.changeEmail') }}
        </UButton>
      </div>
    </UForm>

    <UForm
      v-else
      key="password"
      :schema="passwordSchema"
      :state="passwordState"
      class="mt-6 space-y-4"
      @submit="onPassword"
    >
      <UFormField
        :label="t('auth.forgot.password.new')"
        name="password"
        :help="t('auth.forgot.password.hint')"
      >
        <UInput
          v-model="passwordState.password"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="new-password"
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
      <UFormField :label="t('auth.forgot.password.confirm')" name="confirm">
        <UInput
          v-model="passwordState.confirm"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="new-password"
          size="lg"
          class="w-full"
        />
      </UFormField>
      <UButton type="submit" block size="lg" :loading="isBusy">
        {{ t('auth.forgot.password.submit') }}
      </UButton>
      <UButton
        variant="link"
        color="neutral"
        size="sm"
        class="mx-auto flex"
        :disabled="isBusy"
        @click="startAgain"
      >
        {{ t('auth.forgot.password.startAgain') }}
      </UButton>
    </UForm>

    <p class="mt-6 text-center">
      <ULink
        :to="{ name: `${portal}.login` }"
        class="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-highlighted"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5 rtl:rotate-180" aria-hidden="true" />
        {{ t('auth.forgot.back') }}
      </ULink>
    </p>
  </section>
</template>
