import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class UserRefreshTokenStrategy extends PassportStrategy(Strategy, 'user-refresh-token') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) =>
                request?.cookies?.['refreshToken'] ?? null,
            ExtractJwt.fromAuthHeaderAsBearerToken()]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any) {
        const refreshToken = request?.cookies?.['refreshToken'] ??
        request?.headers?.authorization?.split(' ')[1];

        return { payload, refreshToken };
    }
}