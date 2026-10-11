import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { RefreshTokenPayload, RefreshTokenUser } from '../types/auth.types';

export const REFRESH_COOKIE = 'refreshToken';

/**
 * The refresh token comes from the `refreshToken` cookie (web, and the mobile app,
 * which sends the cookie header itself) or, as a fallback, `Authorization: Bearer`.
 */
const fromCookie = (req: Request): string | null => req?.cookies?.[REFRESH_COOKIE] ?? null;
const fromBearer = ExtractJwt.fromAuthHeaderAsBearerToken();
const extractRefreshToken = (req: Request): string | null => fromCookie(req) ?? fromBearer(req);

@Injectable()
export class UserRefreshTokenStrategy extends PassportStrategy(Strategy, 'user-refresh-token') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: extractRefreshToken,
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            passReqToCallback: true,
        });
    }

    /**
     * Passport has verified the signature and expiry. AuthService then checks that
     * this is the user's CURRENT refresh token, which is why the raw token is kept.
     */
    validate(req: Request, payload: RefreshTokenPayload): RefreshTokenUser | false {
        const refreshToken = extractRefreshToken(req);
        if (payload.type !== 'refresh' || !refreshToken) return false;
        return { id: payload.sub, refreshToken };
    }
}
