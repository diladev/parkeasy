import { http } from '@/shared/api/http'

import { toApiParams, toFilterParams, type UserListParams } from '../model/list-params'
import type { UserAction } from '../model/user-actions'
import {
  messageSchema,
  userDetailSchema,
  userListSchema,
  userStatusChangeSchema,
  type UserDetail,
  type UserList,
  type UserStatusChange,
} from '../model/user.schemas'

const BASE = '/admin/users'

export const usersApi = {
  list: (params: UserListParams, signal?: AbortSignal): Promise<UserList> =>
    http.get(BASE, userListSchema, { params: toApiParams(params), signal }),

  get: (id: number, signal?: AbortSignal): Promise<UserDetail> =>
    http.get(`${BASE}/${id}`, userDetailSchema, { signal }),

  /** POST /admin/users/:id/suspend | restore */
  changeStatus: (id: number, action: UserAction): Promise<UserStatusChange> =>
    http.post(`${BASE}/${id}/${action}`, null, userStatusChangeSchema),

  sendPasswordReset: (id: number): Promise<{ message: string }> =>
    http.post(`${BASE}/${id}/password-reset`, null, messageSchema),

  /** Every account matching the list's filters, as a CSV file. */
  exportCsv: (params: UserListParams) =>
    http.download(`${BASE}/export`, { params: toFilterParams(params) }),
}
