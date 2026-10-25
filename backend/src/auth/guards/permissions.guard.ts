import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { TranslationService } from 'src/i18n/translation.service';
import { UsersService } from 'src/users/users.service';
import { hasAllPermissions, permissionsFor } from '../permissions';
import type { AuthenticatedUser } from '../types/auth.types';

/** The permissions a route needs, e.g. @RequirePermissions(['admin.access']). */
export const RequirePermissions = Reflector.createDecorator<string[]>();

/**
 * Checks @RequirePermissions against the user's role, read from the database on
 * every request, so a role change or suspension applies at once (not when the
 * access token expires). Use it after UserAccessTokenAuthGuard:
 *
 *   @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
 *   @RequirePermissions(['admin.access'])
 *
 * It fails closed: no signed-in user, an unknown role or a lookup error all deny.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly translationService: TranslationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride(RequirePermissions, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const signedIn = request.user;
    if (!signedIn) {
      throw new UnauthorizedException(
        this.translationService.translate('message.UNAUTHORIZED'),
      );
    }

    const user = await this.usersService.findByIdOrNull(signedIn.id);
    if (!user || user.status !== 'active') {
      throw new ForbiddenException(
        this.translationService.translate('message.ACCOUNT_INACTIVE'),
      );
    }
    if (!hasAllPermissions(permissionsFor(user.role), required)) {
      throw new ForbiddenException(
        this.translationService.translate('message.FORBIDDEN'),
      );
    }
    return true;
  }
}
