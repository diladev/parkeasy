import type { UseQueryReturnType } from '@tanstack/vue-query'
import { computed, watch, type ComputedRef } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'

import type { OwnedGarage } from '../model/portal.schemas'
import { useCurrentGarage } from '../store/current-garage.store'

export interface GaragePage<T> {
  garages: ReturnType<typeof useCurrentGarage>['garages']
  current: ComputedRef<OwnedGarage | null>
  query: UseQueryReturnType<T, Error>
  data: ComputedRef<T | undefined>
  /** Messages for GaragePageFrame; '' when there is nothing to say. */
  garagesError: ComputedRef<string>
  hasNoGarages: ComputedRef<boolean>
  loadError: ComputedRef<string>
}

/**
 * The part every portal page shares: the owner's garages, the one on screen,
 * that page's own query for it, and what to say when something is missing.
 */
export function useGaragePage<T>(
  load: (garageId: () => number | null) => UseQueryReturnType<T, Error>,
): GaragePage<T> {
  const { t } = useI18n()
  const { garages, current } = useCurrentGarage()
  const query = load(() => current.value?.id ?? null)
  const data = computed(() => query.data.value)

  const errorText = (error: unknown): string => {
    if (error instanceof ApiError && error.kind === 'network') return t('common.errors.network')
    return error instanceof ApiError && error.message ? error.message : t('common.errors.generic')
  }

  const isGone = computed(
    () => query.error.value instanceof ApiError && query.error.value.kind === 'not-found',
  )
  // The garage was unlinked from this account since the list loaded: reload the
  // list, which then falls back to another garage (or to "no garages").
  watch(isGone, (gone) => {
    if (gone) void garages.refetch()
  })

  return {
    garages,
    current,
    query,
    data,
    garagesError: computed(() =>
      garages.error.value && !garages.data.value ? errorText(garages.error.value) : '',
    ),
    hasNoGarages: computed(() => garages.data.value?.length === 0),
    loadError: computed(() => {
      const error = query.error.value
      if (!error || data.value) return ''
      return isGone.value ? t('garagePortal.garageGone') : errorText(error)
    }),
  }
}
