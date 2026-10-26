import type { GarageListParams } from '../model/list-params'

/** Query keys for the cache; invalidating `all` refreshes every garage list. */
export const garagesKeys = {
  all: ['garages'] as const,
  lists: () => [...garagesKeys.all, 'list'] as const,
  list: (params: GarageListParams) => [...garagesKeys.lists(), params] as const,
}
