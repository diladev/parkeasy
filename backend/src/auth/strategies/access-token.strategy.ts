import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { AccessTokenPayload, AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class UserAccessTokenStrategy extends PassportStrategy(Strategy, 'user-access-token') {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // getOrThrow: the app refuses to start without the secret instead of
            // silently verifying tokens against `undefined`.
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    validate(payload: AccessTokenPayload): AuthenticatedUser | false {
        // Even if someone configures the same secret twice, a refresh or reset
        // token must never be accepted as an access token.
        if (payload.type !== 'access') return false;
        return { id: payload.sub, username: payload.username };
    }
}
