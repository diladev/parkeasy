import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'

import { garagesApi } from '../api/garages.api'
import { garagesKeys } from '../api/garages.keys'
import type { GarageAction } from '../model/garage-actions'

export interface StatusChangeRequest {
  /** A list row or the detail page's garage: only the id is sent. */
  garage: { id: number; name: string }
  action: GarageAction
}

/**
 * Approve, suspend or restore one garage. The result (or the reason it failed)
 * is shown as a toast in the server's words, and every garage list and page is
 * refetched afterwards so rows, counts and badges are correct either way.
 */
export function useGarageStatusChange() {
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
    mutationFn: ({ garage, action }: StatusChangeRequest) =>
      garagesApi.changeStatus(garage.id, action),
    onSuccess: (result) => {
      toast.add({ title: result.message, color: 'success', icon: 'i-lucide-circle-check' })
    },
    onError: (error) => {
      toast.add({ title: messageFor(error), color: 'error', icon: 'i-lucide-circle-alert' })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: garagesKeys.all }),
  })
}
