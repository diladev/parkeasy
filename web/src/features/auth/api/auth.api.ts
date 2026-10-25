import { http, refreshAccessToken } from '@/shared/api/http'

import {
  meResponseSchema,
  messageResponseSchema,
  sessionResponseSchema,
  type MeResponse,
  type SessionResponse,
} from '../model/auth.schemas'
import type { Portal } from '../model/permissions'

const BASE = '/user/local'

export const authApi = {
  /**
   * Signs in to one portal. The backend refuses (403) accounts whose role can't
   * use that portal, before it starts a session, so a driver typing their
   * password here doesn't get signed out of the mobile app.
   */
  login: (
    credentials: { email: string; password: string },
    portal: Portal,
  ): Promise<SessionResponse> =>
    http.post(`${BASE}/login`, { ...credentials, portal }, sessionResponseSchema),

  /** Uses the httpOnly refresh cookie; shared with the 401 interceptor. */
  refresh: (): Promise<string> => refreshAccessToken(),

  me: (signal?: AbortSignal): Promise<MeResponse> =>
    http.get(`${BASE}/me`, meResponseSchema, { signal }),

  /** Ends the session on the server: the refresh cookie stops working. */
  logout: (): Promise<{ message: string }> =>
    http.post(`${BASE}/logout`, null, messageResponseSchema),
}
