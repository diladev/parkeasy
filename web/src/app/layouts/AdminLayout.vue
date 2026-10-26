<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useCan, useSessionStore } from '@/features/auth'
import { pageTitle } from '@/shared/navigation/page-title'

import { buildMenu } from '../navigation/buildMenu'
import { adminShellRoute } from '../router/routes'
import LocaleSwitch from './parts/LocaleSwitch.vue'
import UserMenu from './parts/UserMenu.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const { can } = useCan()

const isSidebarOpen = ref(false)
const isRtl = computed(() => locale.value === 'ckb')

const ADMIN_HOME = '/admin'
const navItems = computed<NavigationMenuItem[]>(() =>
  buildMenu(adminShellRoute.children ?? [], (permissions) => can(permissions), ADMIN_HOME).map(
    (item) => ({
      label: t(item.title),
      icon: item.icon,
      to: item.path,
      // Every admin page starts with /admin: only the Overview itself is "current" there.
      // Other items stay current on their sub-pages (/admin/garages/5 -> Garages).
      exact: item.path === ADMIN_HOME,
    }),
  ),
)

const heading = computed(() => {
  if (pageTitle.value) return pageTitle.value
  const key = route.meta.heading ?? route.meta.title
  return key ? t(key) : ''
})

/** "Garages /" before a sub-page's heading, linking back to the list. */
const parent = computed(() => {
  const name = route.meta.parent
  if (!name) return null
  const resolved = router.resolve({ name })
  return { to: resolved, label: resolved.meta.title ? t(resolved.meta.title) : '' }
})

const roleLabel = computed(() => {
  const role = session.role
  return role === 'admin' || role === 'garage_owner' || role === 'driver' ? t(`roles.${role}`) : ''
})

// SPA navigation doesn't move focus, so screen reader and keyboard users would
// stay on the link they clicked. Move focus to the new page's heading instead.
const headingRef = useTemplateRef<HTMLElement>('heading')
watch(
  () => route.fullPath,
  async () => {
    isSidebarOpen.value = false
    await nextTick()
    headingRef.value?.focus()
  },
)
</script>

<template>
  <UDashboardGroup storage="local" :persistent="false" unit="px">
    <a href="#main" class="skip-link">{{ t('app.skipToContent') }}</a>

    <UDashboardSidebar
      v-model:open="isSidebarOpen"
      :default-size="240"
      :min-size="240"
      :max-size="240"
      :menu="{ side: isRtl ? 'right' : 'left' }"
      :ui="{ root: 'bg-muted', header: 'h-auto py-5', footer: 'border-t border-default py-4' }"
    >
      <template #header>
        <div class="flex items-center gap-2.5">
          <span
            class="flex size-9 items-center justify-center rounded-[10px] bg-primary text-xl font-bold text-white"
            aria-hidden="true"
            >P</span
          >
          <span class="flex flex-col">
            <span class="text-sm font-semibold text-highlighted">{{ t('app.name') }}</span>
            <span class="text-xs text-dimmed">{{ t('app.adminPanel') }}</span>
          </span>
        </div>
      </template>

      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        :aria-label="t('app.mainNavigation')"
        :ui="{ link: 'py-2.5 rounded-[10px]' }"
      />

      <template #footer>
        <div class="flex min-w-0 items-center gap-2.5">
          <UAvatar
            :alt="session.user?.name"
            size="sm"
            :ui="{ root: 'bg-(--ui-color-primary-700)', fallback: 'text-white' }"
          />
          <span class="flex min-w-0 flex-col">
            <span dir="auto" class="truncate text-xs font-medium text-highlighted">{{
              session.user?.name
            }}</span>
            <span class="truncate text-xs text-dimmed">{{ roleLabel }}</span>
          </span>
        </div>
      </template>
    </UDashboardSidebar>

    <UDashboardPanel id="admin-panel">
      <template #header>
        <UDashboardNavbar :as="{ title: 'div' }">
          <template #title>
            <nav
              v-if="parent"
              :aria-label="t('app.breadcrumb')"
              class="flex shrink-0 items-center gap-1.5 text-lg"
            >
              <ULink :to="parent.to" class="text-muted hover:text-highlighted">{{
                parent.label
              }}</ULink>
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-dimmed rtl:rotate-180"
                aria-hidden="true"
              />
            </nav>
            <h1 ref="heading" tabindex="-1" class="truncate text-lg font-medium outline-none">
              {{ heading }}
            </h1>
          </template>
          <template #right>
            <LocaleSwitch />
            <UserMenu />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <main id="main" tabindex="-1" class="outline-none">
          <RouterView />
        </main>
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
