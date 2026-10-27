import { ApiError } from '@/shared/api/errors'

/**
 * What a sign-in or reset form shows when a request fails. The server's 4xx
 * message is already translated (x-lang header) and says exactly what was
 * wrong; 5xx and network errors get our own words instead.
 */
export function authErrorMessage(error: unknown, t: (key: string) => string): string {
  if (error instanceof ApiError) {
    if (error.kind === 'network') return t('auth.errors.network')
    if (error.message !== '') return error.message
  }
  return t('auth.errors.generic')
}
