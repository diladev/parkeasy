/**
 * The access token lives here, in memory only: not in Pinia, localStorage or
 * sessionStorage, so an XSS bug can't read it from storage and it disappears
 * with the tab. After a reload the session comes back through the httpOnly
 * refresh cookie (see shared/api/http.ts).
 */
let accessToken: string | null = null

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string): void => {
    accessToken = token
  },
  clear: (): void => {
    accessToken = null
  },
}
