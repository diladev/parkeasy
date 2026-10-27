import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'

import { portalApi, portalKeys } from '../api/portal.api'
import type { LiveSlots, SlotAction } from '../model/portal.schemas'

/** Cars come and go: the grid refreshes this often while the tab is open. */
const REFRESH_MS = 15_000

export function useLiveSlots(garageId: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: computed(() => portalKeys.slots(toValue(garageId) ?? 0)),
    queryFn: ({ signal }) => portalApi.slots(toValue(garageId) ?? 0, signal),
    enabled: computed(() => toValue(garageId) !== null),
    refetchInterval: REFRESH_MS,
  })
}

/**
 * Block a slot or make it free again. The answer replaces the slot in the
 * grid straight away; the server's message (or the reason it refused) is
 * shown as a toast. Everything is refetched afterwards either way.
 */
export function useSlotAction(garageId: MaybeRefOrGetter<number | null>) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  const messageFor = (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.kind === 'network') return t('common.errors.network')
      if (error.message !== '') return error.message
    }
    return t('common.errors.generic')
  }

  return useMutation({
    mutationFn: ({ slotId, action }: { slotId: number; action: SlotAction }) =>
      portalApi.changeSlot(toValue(garageId) ?? 0, slotId, action),
    onSuccess: ({ message, slot }) => {
      const id = toValue(garageId)
      if (id !== null) {
        queryClient.setQueryData<LiveSlots>(portalKeys.slots(id), (current) =>
          current
            ? { ...current, slots: current.slots.map((s) => (s.id === slot.id ? slot : s)) }
            : current,
        )
      }
      toast.add({ title: message, color: 'success', icon: 'i-lucide-circle-check' })
    },
    onError: (error) => {
      toast.add({ title: messageFor(error), color: 'error', icon: 'i-lucide-circle-alert' })
    },
    // The dashboard's occupancy counts blocked slots out, so it changes too.
    // Not awaited: the button is ready again as soon as the answer is in.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: portalKeys.all })
    },
  })
}
