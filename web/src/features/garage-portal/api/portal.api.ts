import { http } from '@/shared/api/http'

import {
  dashboardSchema,
  liveSlotsSchema,
  ownedGaragesSchema,
  slotChangeSchema,
  type GarageDashboard,
  type LiveSlot,
  type LiveSlots,
  type OwnedGarage,
  type SlotAction,
} from '../model/portal.schemas'

const BASE = '/garage/garages'

/** Query keys for the cache. */
export const portalKeys = {
  all: ['garage-portal'] as const,
  garages: () => [...portalKeys.all, 'garages'] as const,
  dashboard: (id: number) => [...portalKeys.all, 'dashboard', id] as const,
  slots: (id: number) => [...portalKeys.all, 'slots', id] as const,
}

export const portalApi = {
  /** The signed-in owner's garages. */
  myGarages: (signal?: AbortSignal): Promise<OwnedGarage[]> =>
    http.get(BASE, ownedGaragesSchema, { signal }),

  dashboard: (id: number, signal?: AbortSignal): Promise<GarageDashboard> =>
    http.get(`${BASE}/${id}/dashboard`, dashboardSchema, { signal }),

  /** Every slot with its status, and the booking holding it. */
  slots: (id: number, signal?: AbortSignal): Promise<LiveSlots> =>
    http.get(`${BASE}/${id}/slots`, liveSlotsSchema, { signal }),

  /** block: out of service · release: free again. */
  changeSlot: (
    garageId: number,
    slotId: number,
    action: SlotAction,
  ): Promise<{ message: string; slot: LiveSlot }> =>
    http.post(`${BASE}/${garageId}/slots/${slotId}/${action}`, null, slotChangeSchema),
}
