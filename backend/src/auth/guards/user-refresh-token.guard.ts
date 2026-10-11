import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { TranslationService } from "src/i18n/translation.service";

/** Requires a valid refresh token (cookie or Bearer). Puts { id, refreshToken } on request.user. */
@Injectable()
export class UserRefreshTokenAuthGuard extends AuthGuard('user-refresh-token') {
    constructor(private readonly translationService: TranslationService) {
        super();
    }

    handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
        if (err || !user) {
            throw new UnauthorizedException(this.translationService.translate('message.SESSION_EXPIRED'));
        }
        return user;
    }
}
