import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'

import { portalApi, portalKeys } from '../api/portal.api'
import type { LotSettingsBody } from '../model/lot-settings'

/**
 * One garage's settings; waits until a garage is chosen. Not refreshed in the
 * background: it would pull the form out from under the owner's edits.
 */
export function useLotSettings(garageId: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: computed(() => portalKeys.settings(toValue(garageId) ?? 0)),
    queryFn: ({ signal }) => portalApi.settings(toValue(garageId) ?? 0, signal),
    enabled: computed(() => toValue(garageId) !== null),
    refetchOnWindowFocus: false,
  })
}

/**
 * Saves the settings. The answer becomes the page's data straight away, and
 * every other portal page is refetched (the name shows in the switcher, the
 * prices in the walk-in fees). A failure is left to the page to show.
 */
export function useSaveLotSettings(garageId: MaybeRefOrGetter<number | null>) {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (body: LotSettingsBody) => portalApi.saveSettings(toValue(garageId) ?? 0, body),
    onSuccess: async (result) => {
      queryClient.setQueryData(portalKeys.settings(result.settings.id), result.settings)
      toast.add({ title: result.message, color: 'success', icon: 'i-lucide-circle-check' })
      await queryClient.invalidateQueries({
        queryKey: portalKeys.all,
        predicate: (query) => query.queryKey[1] !== 'settings',
      })
    },
  })
}
