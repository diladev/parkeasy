import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { garagesApi } from '../api/garages.api'
import { garagesKeys } from '../api/garages.keys'
import type { CreateGarageBody, UpdateGarageBody } from '../model/garage-form'

export type SaveGarageRequest =
  { mode: 'create'; body: CreateGarageBody } | { mode: 'edit'; id: number; body: UpdateGarageBody }

/**
 * Adds a garage or saves its details. Success is a toast in the server's words;
 * a failure is left to the form, which shows it next to the fields to fix.
 * Every garage list and page is refetched, so the new name or row shows at once.
 */
export function useSaveGarage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (request: SaveGarageRequest) =>
      request.mode === 'create'
        ? garagesApi.create(request.body)
        : garagesApi.update(request.id, request.body),
    onSuccess: async (result) => {
      toast.add({ title: result.message, color: 'success', icon: 'i-lucide-circle-check' })
      await queryClient.invalidateQueries({ queryKey: garagesKeys.all })
    },
  })
}
