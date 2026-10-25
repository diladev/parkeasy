import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { I18nContext } from 'nestjs-i18n';

/**
 * Rate limits for the sign-in routes (see AuthController). Requests are counted
 * per IP *and* email, so password guessing against one account is slowed even
 * when it comes from many addresses, and one busy network (a café, a campus)
 * doesn't lock everyone else out.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected getTracker(request: Record<string, unknown>): Promise<string> {
    const body = request.body as { email?: unknown } | undefined;
    const email =
      typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const ip = typeof request.ip === 'string' ? request.ip : 'unknown';
    return Promise.resolve(email ? `${ip}:${email}` : ip);
  }

  /** The 429 message, in the request's language. */
  protected getErrorMessage(): Promise<string> {
    const translated = I18nContext.current()?.t('message.TOO_MANY_REQUESTS');
    return Promise.resolve(
      typeof translated === 'string'
        ? translated
        : 'Too many attempts. Please wait a few minutes and try again.',
    );
  }
}
