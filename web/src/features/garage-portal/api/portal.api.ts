import { http } from '@/shared/api/http'

import {
  dashboardSchema,
  ownedGaragesSchema,
  type GarageDashboard,
  type OwnedGarage,
} from '../model/portal.schemas'

const BASE = '/garage/garages'

/** Query keys for the cache. */
export const portalKeys = {
  all: ['garage-portal'] as const,
  garages: () => [...portalKeys.all, 'garages'] as const,
  dashboard: (id: number) => [...portalKeys.all, 'dashboard', id] as const,
}

export const portalApi = {
  /** The signed-in owner's garages. */
  myGarages: (signal?: AbortSignal): Promise<OwnedGarage[]> =>
    http.get(BASE, ownedGaragesSchema, { signal }),

  dashboard: (id: number, signal?: AbortSignal): Promise<GarageDashboard> =>
    http.get(`${BASE}/${id}/dashboard`, dashboardSchema, { signal }),
}
