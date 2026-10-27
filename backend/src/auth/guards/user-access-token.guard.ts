import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { TranslationService } from 'src/i18n/translation.service';

/** Requires a valid access token. Puts { id, username } on request.user. */
@Injectable()
export class UserAccessTokenAuthGuard extends AuthGuard('user-access-token') {
  constructor(private readonly translationService: TranslationService) {
    super();
  }

  // Throws a translated 401 instead of Passport's plain "Unauthorized".
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new UnauthorizedException(
        this.translationService.translate('message.UNAUTHORIZED'),
      );
    }
    return user;
  }
}
