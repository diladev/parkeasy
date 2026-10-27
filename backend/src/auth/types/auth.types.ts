import type { User } from 'src/users/entities/user.entity';
import type { Permission, Role } from '../permissions';

/** Claims inside an access token (sent as `Authorization: Bearer ...`). */
export interface AccessTokenPayload {
  sub: number;
  username: string;
  type: 'access';
}

/**
 * Claims inside a refresh token. `jti` is random, so two tokens issued in the
 * same second are still different (each one can only be used once).
 */
export interface RefreshTokenPayload {
  sub: number;
  type: 'refresh';
  jti: string;
}

/** Claims inside the short-lived token that /verify-otp hands to /reset-password. */
export interface PasswordResetPayload {
  sub: number;
  type: 'password-reset';
  /** Fingerprint of the password hash when the token was issued. Once the
   *  password changes it no longer matches, so the token works only once. */
  pwd: string;
}

/** What the access-token guard puts on `request.user`. */
export interface AuthenticatedUser {
  id: number;
  username: string;
}

/** What the refresh-token guard puts on `request.user`. */
export interface RefreshTokenUser {
  id: number;
  refreshToken: string;
}

/** Result of register, login and refresh. Lifetimes are in seconds. */
export interface AuthSession {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  user: User;
}

/** What the client receives: the refresh token travels in a cookie, not in the body. */
export type AuthResponse = Omit<AuthSession, 'refreshToken'>;

/** GET /user/local/me: who is signed in and what they may do, decided by the server. */
export interface MeResponse {
  user: { id: number; name: string; email: string };
  role: Role;
  permissions: Permission[];
}
