import { http } from '@/shared/api/http'

import type { GarageAction } from '../model/garage-actions'
import {
  garageDetailSchema,
  garageListSchema,
  statusChangeSchema,
  type GarageDetail,
  type GarageList,
  type StatusChange,
} from '../model/garage.schemas'
import { toApiParams, type GarageListParams } from '../model/list-params'

const BASE = '/admin/garages'

export const garagesApi = {
  list: (params: GarageListParams, signal?: AbortSignal): Promise<GarageList> =>
    http.get(BASE, garageListSchema, { params: toApiParams(params), signal }),

  get: (id: number, signal?: AbortSignal): Promise<GarageDetail> =>
    http.get(`${BASE}/${id}`, garageDetailSchema, { signal }),

  /** POST /admin/garages/:id/approve | suspend | restore */
  changeStatus: (id: number, action: GarageAction): Promise<StatusChange> =>
    http.post(`${BASE}/${id}/${action}`, null, statusChangeSchema),
}
