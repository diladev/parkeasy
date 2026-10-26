import { useToast } from '@nuxt/ui/composables'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'

import { ApiError } from '@/shared/api/errors'
import { saveFile } from '@/shared/lib/download'

import { usersApi } from '../api/users.api'
import { usersKeys } from '../api/users.keys'
import type { UserListParams } from '../model/list-params'
import type { UserAction } from '../model/user-actions'

/** The server's words for a failure (already translated); ours for network and 5xx. */
function useFailureMessage() {
  const { t } = useI18n()
  return (error: unknown): string => {
    if (error instanceof ApiError) {
      if (error.kind === 'network') return t('common.errors.network')
      if (error.message !== '') return error.message
    }
    return t('common.errors.generic')
  }
}

function useToasts() {
  const toast = useToast()
  const messageFor = useFailureMessage()
  return {
    success: (title: string) =>
      toast.add({ title, color: 'success', icon: 'i-lucide-circle-check' }),
    failure: (error: unknown) =>
      toast.add({ title: messageFor(error), color: 'error', icon: 'i-lucide-circle-alert' }),
  }
}

/**
 * Suspend or restore one account. Every user list and page is refetched
 * afterwards, so badges and buttons are right whether it worked or not.
 */
export function useUserStatusChange() {
  const queryClient = useQueryClient()
  const toasts = useToasts()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: UserAction }) =>
      usersApi.changeStatus(id, action),
    onSuccess: (result) => toasts.success(result.message),
    onError: toasts.failure,
    onSettled: () => queryClient.invalidateQueries({ queryKey: usersKeys.all }),
  })
}

/** Emails the account a reset code; the toast says where it went, or why not. */
export function usePasswordReset() {
  const toasts = useToasts()
  return useMutation({
    mutationFn: (id: number) => usersApi.sendPasswordReset(id),
    onSuccess: (result) => toasts.success(result.message),
    onError: toasts.failure,
  })
}

/** Downloads the accounts that match the list's current role and search. */
export function useUsersExport() {
  const toasts = useToasts()
  return useMutation({
    mutationFn: (params: UserListParams) => usersApi.exportCsv(params),
    onSuccess: ({ blob, filename }) => saveFile(blob, filename ?? 'parkeasy-users.csv'),
    onError: toasts.failure,
  })
}
