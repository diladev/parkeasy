import { MutationCache, QueryCache, QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import type { App } from 'vue'

import { ApiError } from '@/shared/api/errors'

/** Errors a retry can't fix: the request itself is wrong or not allowed. */
const PERMANENT_ERRORS: ReadonlySet<ApiError['kind']> = new Set([
  'validation',
  'auth',
  'forbidden',
  'not-found',
  'conflict',
  'rate-limit',
  'cancelled',
])

export interface QueryClientOptions {
  /** Called when the API answers 403, e.g. the admin role was removed meanwhile. */
  onForbidden?: () => void
}

/**
 * Server data (lists, records) lives in this cache, not in Pinia
 * (01-architecture §4.3). One client per app, cleared on sign-out.
 */
export function createQueryClient(options: QueryClientOptions = {}): QueryClient {
  const onError = (error: unknown) => {
    if (error instanceof ApiError && error.kind === 'forbidden') options.onForbidden?.()
  }
  return new QueryClient({
    queryCache: new QueryCache({ onError }),
    mutationCache: new MutationCache({ onError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) =>
          !(error instanceof ApiError && PERMANENT_ERRORS.has(error.kind)) && failureCount < 2,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  })
}

export function installQuery(app: App, queryClient: QueryClient): void {
  app.use(VueQueryPlugin, { queryClient })
}
