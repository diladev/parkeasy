import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/**
 * The value the route's guard put on `request.user`:
 * - behind UserAccessTokenAuthGuard:  AuthenticatedUser  ({ id, username })
 * - behind UserRefreshTokenAuthGuard: RefreshTokenUser   ({ id, refreshToken })
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<Request>().user,
);
