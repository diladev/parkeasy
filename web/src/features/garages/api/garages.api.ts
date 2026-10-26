import { http } from '@/shared/api/http'

import type { GarageAction } from '../model/garage-actions'
import type { CreateGarageBody, UpdateGarageBody } from '../model/garage-form'
import {
  garageDetailSchema,
  garageListSchema,
  garageSavedSchema,
  statusChangeSchema,
  type GarageDetail,
  type GarageList,
  type GarageSaved,
  type StatusChange,
} from '../model/garage.schemas'
import { toApiParams, type GarageListParams } from '../model/list-params'

const BASE = '/admin/garages'

export const garagesApi = {
  list: (params: GarageListParams, signal?: AbortSignal): Promise<GarageList> =>
    http.get(BASE, garageListSchema, { params: toApiParams(params), signal }),

  get: (id: number, signal?: AbortSignal): Promise<GarageDetail> =>
    http.get(`${BASE}/${id}`, garageDetailSchema, { signal }),

  /** A new, approved garage with its levels, slots and (optionally) its owner. */
  create: (body: CreateGarageBody): Promise<GarageSaved> =>
    http.post(BASE, body, garageSavedSchema),

  /** Only the fields that changed. */
  update: (id: number, body: UpdateGarageBody): Promise<GarageSaved> =>
    http.patch(`${BASE}/${id}`, body, garageSavedSchema),

  /** POST /admin/garages/:id/approve | suspend | restore */
  changeStatus: (id: number, action: GarageAction): Promise<StatusChange> =>
    http.post(`${BASE}/${id}/${action}`, null, statusChangeSchema),
}
