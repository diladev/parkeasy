import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomInt, randomUUID } from 'crypto';

import { hashPassword, verifyPassword } from 'src/common/security/password';
import { hmacSha256, safeEqual, sha256 } from 'src/common/security/token-hash';
import tokenExpiration from 'src/config/token-expiration';
import { TranslationService } from 'src/i18n/translation.service';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import {
  ForgotPasswordDto,
  RegisterUserDto,
  ResetPasswordDto,
  UserLocalLoginDto,
  VerifyOtpDto,
} from 'src/users/dtos';
import { canUsePortal, permissionsFor } from './permissions';
import type {
  AccessTokenPayload,
  AuthSession,
  MeResponse,
  PasswordResetPayload,
  RefreshTokenPayload,
} from './types/auth.types';

/** How long the emailed reset code is valid. */
const OTP_TTL_MINUTES = 10;
/** A new code can be requested this long after the previous one (stops email flooding). */
const OTP_RESEND_COOLDOWN_SECONDS = 60;
/** Wrong guesses allowed before the code is thrown away. */
const OTP_MAX_ATTEMPTS = 5;
/** How long the user has to choose a new password after entering the code. */
const RESET_TOKEN_TTL_SECONDS = 10 * 60;

/** A short fingerprint of the password hash (see PasswordResetPayload.pwd). */
const passwordFingerprint = (passwordHash: string) =>
  sha256(passwordHash).slice(0, 16);

/**
 * Sessions and passwords. Profile data lives in UsersService: this service only
 * deals with credentials and tokens.
 *
 * Session model: one session per signed-in device (users/entities/session.entity.ts).
 * Login and register start one; every refresh issues a new token pair and
 * stores the hash of the new refresh token, so each refresh token works exactly
 * once. Signing in on a phone doesn't sign the browser out. A password change,
 * a suspension or a deleted account ends every session.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly secrets: { access: string; refresh: string; reset: string };
  private dummyHash?: Promise<string>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly translationService: TranslationService,
    config: ConfigService,
  ) {
    this.secrets = {
      access: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      refresh: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      reset: config.getOrThrow<string>('JWT_RESET_PASSWORD_SECRET'),
    };
  }

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }

  // --------------------------------------------------------------- sessions

  async register(dto: RegisterUserDto): Promise<AuthSession> {
    const user = await this.usersService.register(dto);
    return this.issueTokens(user, randomUUID(), null);
  }

  async login(dto: UserLocalLoginDto): Promise<AuthSession> {
    const user = await this.usersService.findByEmail(dto.email);

    // The same error, after the same amount of work, whether the email or the
    // password is wrong: the endpoint can't be used to find out who has an account.
    const passwordHash = user?.password ?? (await this.getDummyHash());
    const passwordMatches = await verifyPassword(dto.password, passwordHash);
    if (!user || !passwordMatches) {
      throw new UnauthorizedException(this.t('INVALID_CREDENTIALS'));
    }

    this.assertActive(user);
    // Checked before a session starts: a driver trying the Admin Panel is
    // refused without being signed out of the mobile app.
    if (dto.portal && !canUsePortal(user.role, dto.portal)) {
      throw new ForbiddenException(this.t('PORTAL_NOT_ALLOWED'));
    }
    return this.issueTokens(user, randomUUID(), null);
  }

  /** The signed-in user and their permissions, read fresh from the database. */
  async me(userId: number): Promise<MeResponse> {
    const user = await this.usersService.findByIdOrNull(userId);
    if (!user) {
      throw new UnauthorizedException(this.t('UNAUTHORIZED'));
    }
    this.assertActive(user);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      role: user.role,
      permissions: permissionsFor(user.role),
    };
  }

  /**
   * The guard has checked the token's signature; the session swaps it for a
   * new one only if it's the session's CURRENT token (see rotateSession).
   */
  async refresh(
    userId: number,
    sessionId: string,
    refreshToken: string,
  ): Promise<AuthSession> {
    const user = await this.usersService.findByIdOrNull(userId);
    if (!user) throw new UnauthorizedException(this.t('SESSION_EXPIRED'));
    this.assertActive(user);
    // Signed out, ended (password change, suspension), or the token was already used.
    return this.issueTokens(user, sessionId, sha256(refreshToken));
  }

  /** Signs this device out; other devices stay signed in. */
  async logout(
    userId: number,
    sessionId: string | undefined,
  ): Promise<{ message: string }> {
    if (sessionId) await this.usersService.endSession(userId, sessionId);
    return { message: this.t('LOGOUT_SUCCESS') };
  }

  /** Signs the user out on every device (an admin suspended the account). */
  async endAllSessions(userId: number): Promise<void> {
    await this.usersService.endAllSessions(userId);
  }

  // ---------------------------------------------------------- password reset

  /** Step 1: email a 6-digit code. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(dto.email);

    if (user && user.status === 'active' && !this.isInResendCooldown(user)) {
      await this.emailResetCode(user);
    }

    // Same answer whether or not the account exists.
    return { message: this.t('RESET_CODE_SENT') };
  }

  /**
   * The Admin Panel's "Send password reset": the same code and email as
   * Forgot password, but the admin is told plainly what happened, because
   * they already know the account exists.
   */
  async sendResetCodeFromAdmin(user: User): Promise<{ message: string }> {
    if (user.status !== 'active') {
      throw new ConflictException(this.t('RESET_NEEDS_ACTIVE_ACCOUNT'));
    }
    if (this.isInResendCooldown(user)) {
      throw new HttpException(
        this.t('RESET_CODE_RECENTLY_SENT'),
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.emailResetCode(user);
    return {
      message: this.t('RESET_CODE_SENT_TO', {
        email: user.email,
        minutes: OTP_TTL_MINUTES,
      }),
    };
  }

  private async emailResetCode(user: User): Promise<void> {
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
    await this.usersService.storeOtp(user.id, hmacSha256(code), expiresAt);

    try {
      await this.mailService.sendPasswordResetCode(
        user.email,
        user.name,
        code,
        OTP_TTL_MINUTES,
      );
    } catch (error) {
      this.logger.error(
        `Could not email the reset code to user ${user.id}`,
        error instanceof Error ? error.stack : String(error),
      );
      await this.usersService.clearOtp(user.id);
      throw new ServiceUnavailableException(this.t('EMAIL_SEND_FAILED'));
    }
  }

  /** Step 2: check the code and hand out a short-lived reset token. */
  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; token: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.otp_hash || !user.otp_expires_at) {
      throw new BadRequestException(this.t('OTP_INVALID'));
    }

    if (user.otp_expires_at.getTime() < Date.now()) {
      await this.usersService.clearOtp(user.id);
      throw new BadRequestException(this.t('OTP_EXPIRED'));
    }
    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      await this.usersService.clearOtp(user.id);
      throw new BadRequestException(this.t('OTP_TOO_MANY_ATTEMPTS'));
    }
    if (!safeEqual(hmacSha256(dto.otp), user.otp_hash)) {
      await this.usersService.incrementOtpAttempts(user.id);
      throw new BadRequestException(this.t('OTP_INVALID'));
    }

    await this.usersService.clearOtp(user.id);

    const payload: PasswordResetPayload = {
      sub: user.id,
      type: 'password-reset',
      pwd: passwordFingerprint(user.password),
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.secrets.reset,
      expiresIn: RESET_TOKEN_TTL_SECONDS,
    });

    return { message: this.t('OTP_VERIFIED'), token };
  }

  /** Step 3: set the new password. Signs the user out on every device. */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const invalidToken = () =>
      new BadRequestException(this.t('RESET_TOKEN_INVALID'));

    let payload: PasswordResetPayload;
    try {
      payload = await this.jwtService.verifyAsync<PasswordResetPayload>(
        dto.token,
        {
          secret: this.secrets.reset,
          algorithms: ['HS256'],
        },
      );
    } catch {
      throw invalidToken();
    }
    if (payload.type !== 'password-reset') {
      throw invalidToken();
    }

    const user = await this.usersService.findByIdOrNull(payload.sub);
    if (!user || payload.pwd !== passwordFingerprint(user.password)) {
      // No user, or the password already changed: this token was used before.
      throw invalidToken();
    }

    await this.usersService.setPassword(user.id, dto.new_password);
    return { message: this.t('PASSWORD_RESET_SUCCESS') };
  }

  // ---------------------------------------------------------------- helpers

  /**
   * A new token pair for session `sessionId`: a new session (`replacing`
   * null), or the rotation of one whose current refresh token hashes to `replacing`.
   */
  private async issueTokens(
    user: User,
    sessionId: string,
    replacing: string | null,
  ): Promise<AuthSession> {
    const { access_token_expiration, refresh_token_expiration } =
      tokenExpiration();

    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      type: 'access',
      sid: sessionId,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
      sid: sessionId,
      jti: randomUUID(),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.secrets.access,
        expiresIn: access_token_expiration,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.secrets.refresh,
        expiresIn: refresh_token_expiration,
      }),
    ]);

    // Only the hash is stored, so a leaked database can't be used to sign in.
    const tokenHash = sha256(refreshToken);
    const expiresAt = new Date(Date.now() + refresh_token_expiration * 1000);
    if (replacing === null) {
      await this.usersService.startSession(
        user.id,
        sessionId,
        tokenHash,
        expiresAt,
      );
    } else {
      const rotated = await this.usersService.rotateSession(
        user.id,
        sessionId,
        replacing,
        tokenHash,
        expiresAt,
      );
      if (!rotated) {
        throw new UnauthorizedException(this.t('SESSION_EXPIRED'));
      }
    }

    return {
      accessToken,
      accessTokenExpiresIn: access_token_expiration,
      refreshToken,
      refreshTokenExpiresIn: refresh_token_expiration,
      user,
    };
  }

  private assertActive(user: User): void {
    if (user.status !== 'active') {
      throw new ForbiddenException(this.t('ACCOUNT_INACTIVE'));
    }
  }

  /** True if the last code was sent less than OTP_RESEND_COOLDOWN_SECONDS ago. */
  private isInResendCooldown(user: User): boolean {
    if (!user.otp_expires_at) return false;
    const sentAt = user.otp_expires_at.getTime() - OTP_TTL_MINUTES * 60_000;
    return Date.now() - sentAt < OTP_RESEND_COOLDOWN_SECONDS * 1000;
  }

  /** A real bcrypt hash to check against when the email is unknown (see login). */
  private getDummyHash(): Promise<string> {
    this.dummyHash ??= hashPassword(randomUUID());
    return this.dummyHash;
  }
}
