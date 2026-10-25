import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';

import { TranslationService } from 'src/i18n/translation.service';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export interface RequestOrigin {
  method: string;
  /** The Sec-Fetch-Site header browsers send: same-origin, same-site, cross-site or none. */
  secFetchSite?: string;
  origin?: string;
  host?: string;
}

/**
 * Whether a request may change something. Browsers attach cookies (the web
 * refresh token) to cross-site requests, so a state-changing request from
 * another site is refused unless that site is a trusted web portal. Requests
 * without browser headers (the mobile app, payment webhooks, curl) are allowed:
 * they can't be forged by a web page. The same rules as NestJS 12's
 * enableCsrfProtection(), which this replaces until the API moves to Nest 12.
 */
export function isAllowedRequest(
  { method, secFetchSite, origin, host }: RequestOrigin,
  trustedOrigins: ReadonlySet<string>,
): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return true;
  if (secFetchSite === 'same-origin' || secFetchSite === 'none') return true;
  if (origin && trustedOrigins.has(origin)) return true;
  if (!secFetchSite && !origin) return true;
  if (!secFetchSite && origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

/** Blocks cross-site form posts and fetches (CSRF). Applied to every route in AppModule. */
@Injectable()
export class FetchMetadataMiddleware implements NestMiddleware {
  private readonly trustedOrigins: ReadonlySet<string>;

  constructor(
    config: ConfigService,
    private readonly translationService: TranslationService,
  ) {
    // The web portals allowed by CORS are the only other origins we trust.
    this.trustedOrigins = new Set(
      (config.get<string>('CORS_ORIGINS') ?? '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    );
  }

  use(request: Request, _response: Response, next: NextFunction): void {
    const allowed = isAllowedRequest(
      {
        method: request.method,
        secFetchSite: request.get('sec-fetch-site'),
        origin: request.get('origin'),
        host: request.get('host'),
      },
      this.trustedOrigins,
    );
    if (!allowed) {
      throw new ForbiddenException(
        this.translationService.translate('message.CROSS_ORIGIN_BLOCKED'),
      );
    }
    next();
  }
}
