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
  type WalkInPaymentMethod,
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

  /** A car parked without the app: the slot becomes occupied for this plate. */
  startWalkIn: (
    garageId: number,
    slotId: number,
    plate: string,
  ): Promise<{ message: string; slot: LiveSlot }> =>
    http.post(`${BASE}/${garageId}/slots/${slotId}/walk-in`, { plate }, slotChangeSchema),

  /** The walk-in left: the server charges every started hour and frees the slot. */
  endWalkIn: (
    garageId: number,
    bookingId: number,
    paymentMethod: WalkInPaymentMethod,
  ): Promise<{ message: string; slot: LiveSlot }> =>
    http.post(
      `${BASE}/${garageId}/walk-ins/${bookingId}/end`,
      { payment_method: paymentMethod },
      slotChangeSchema,
    ),

  /** Entered by mistake: removed without a charge. */
  removeWalkIn: (
    garageId: number,
    bookingId: number,
  ): Promise<{ message: string; slot: LiveSlot }> =>
    http.post(`${BASE}/${garageId}/walk-ins/${bookingId}/remove`, null, slotChangeSchema),
}
