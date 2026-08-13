import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as dotenv from 'dotenv';

dotenv.config();

export class UserAccessTokenStrategy extends PassportStrategy(Strategy, 'user-access-token') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET,
        });
    }

    async validate(payload: any) {
        return { id: payload.sub, username: payload.username, status: payload.status, lang: payload.lang };
    }
}