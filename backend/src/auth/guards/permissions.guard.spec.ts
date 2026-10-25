import {
  ForbiddenException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { TranslationService } from 'src/i18n/translation.service';
import type { User } from 'src/users/entities/user.entity';
import type { UsersService } from 'src/users/users.service';
import { PermissionsGuard } from './permissions.guard';

function contextFor(user?: { id: number }): ExecutionContext {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  const translations = {
    translate: (key: string) => key,
  } as unknown as TranslationService;
  let stored: Partial<User> | null;
  let required: string[] | undefined;
  let guard: PermissionsGuard;

  beforeEach(() => {
    stored = { id: 1, role: 'admin', status: 'active' };
    required = ['admin.access'];
    const reflector = {
      getAllAndOverride: () => required,
    } as unknown as Reflector;
    const users = {
      findByIdOrNull: () => Promise.resolve(stored),
    } as unknown as UsersService;
    guard = new PermissionsGuard(reflector, users, translations);
  });

  it('lets an admin through', async () => {
    await expect(guard.canActivate(contextFor({ id: 1 }))).resolves.toBe(true);
  });

  it('refuses a role without the permission', async () => {
    stored = { id: 1, role: 'driver', status: 'active' };
    await expect(
      guard.canActivate(contextFor({ id: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('reads the role from the database, so a demotion applies at once', async () => {
    stored = { id: 1, role: 'garage_owner', status: 'active' };
    await expect(
      guard.canActivate(contextFor({ id: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refuses suspended and deleted accounts', async () => {
    stored = { id: 1, role: 'admin', status: 'suspended' };
    await expect(
      guard.canActivate(contextFor({ id: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    stored = null;
    await expect(
      guard.canActivate(contextFor({ id: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('fails closed without a signed-in user', async () => {
    await expect(guard.canActivate(contextFor())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('only needs a signed-in, active user when no permission is listed', async () => {
    required = undefined;
    stored = { id: 1, role: 'driver', status: 'active' };
    await expect(guard.canActivate(contextFor({ id: 1 }))).resolves.toBe(true);
  });
});
