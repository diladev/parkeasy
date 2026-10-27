import { http, refreshAccessToken } from '@/shared/api/http'

import {
  meResponseSchema,
  messageResponseSchema,
  sessionResponseSchema,
  verifyOtpResponseSchema,
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

  /** Step 1 of 3. Answers the same whether or not the account exists. */
  forgotPassword: (email: string): Promise<{ message: string }> =>
    http.post(`${BASE}/forgot-password`, { email }, messageResponseSchema),

  /** Step 2 of 3: the emailed code for a token that allows step 3. */
  verifyOtp: (email: string, otp: string): Promise<{ message: string; token: string }> =>
    http.post(`${BASE}/verify-otp`, { email, otp }, verifyOtpResponseSchema),

  /** Step 3 of 3. Signs the account out everywhere. */
  resetPassword: (token: string, newPassword: string): Promise<{ message: string }> =>
    http.post(
      `${BASE}/reset-password`,
      { token, new_password: newPassword },
      messageResponseSchema,
    ),
}
