import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { hashPassword } from 'src/common/security/password';
import type { TranslationService } from 'src/i18n/translation.service';
import type { MailService } from 'src/mail/mail.service';
import type { User } from 'src/users/entities/user.entity';
import type { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

const PASSWORD = 'Demo@1234';

describe('AuthService portal sign-in', () => {
  let users: Map<string, Partial<User>>;
  let storedHashes: Map<number, string | null>;
  let service: AuthService;

  beforeAll(async () => {
    const password = await hashPassword(PASSWORD);
    users = new Map([
      [
        'admin@parkeasy.app',
        {
          id: 1,
          name: 'Admin',
          email: 'admin@parkeasy.app',
          username: 'admin',
          role: 'admin',
          status: 'active',
          password,
        },
      ],
      [
        'aram@example.com',
        {
          id: 2,
          name: 'Aram',
          email: 'aram@example.com',
          username: 'aram',
          role: 'driver',
          status: 'active',
          password,
        },
      ],
    ]);
  });

  beforeEach(() => {
    storedHashes = new Map();
    const usersService = {
      findByEmail: (email: string) => Promise.resolve(users.get(email) ?? null),
      findByIdOrNull: (id: number) =>
        Promise.resolve([...users.values()].find((u) => u.id === id) ?? null),
      setRefreshTokenHash: (id: number, hash: string | null) => {
        storedHashes.set(id, hash);
        return Promise.resolve();
      },
    } as unknown as UsersService;
    const config = {
      getOrThrow: (key: string) => `test-secret-${key}`,
    } as unknown as ConfigService;
    const translations = {
      translate: (key: string) => key,
    } as unknown as TranslationService;
    service = new AuthService(
      new JwtService({}),
      usersService,
      {} as MailService,
      translations,
      config,
    );
  });

  it('signs an admin in to the Admin Panel', async () => {
    const session = await service.login({
      email: 'admin@parkeasy.app',
      password: PASSWORD,
      portal: 'admin',
    });
    expect(session.accessToken).toEqual(expect.any(String));
    expect(storedHashes.get(1)).toEqual(expect.any(String));
  });

  it('refuses a driver at the Admin Panel without touching their session', async () => {
    storedHashes.set(2, 'phone-session');
    await expect(
      service.login({
        email: 'aram@example.com',
        password: PASSWORD,
        portal: 'admin',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(storedHashes.get(2)).toBe('phone-session');
  });

  it('still checks the password first, with the usual error', async () => {
    await expect(
      service.login({
        email: 'aram@example.com',
        password: 'wrong',
        portal: 'admin',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('keeps mobile sign-in (no portal) working for drivers', async () => {
    const session = await service.login({
      email: 'aram@example.com',
      password: PASSWORD,
    });
    expect(session.accessToken).toEqual(expect.any(String));
  });

  it('describes the signed-in user and their permissions', async () => {
    await expect(service.me(1)).resolves.toEqual({
      user: { id: 1, name: 'Admin', email: 'admin@parkeasy.app' },
      role: 'admin',
      permissions: ['admin.access'],
    });
    await expect(service.me(2)).resolves.toMatchObject({
      role: 'driver',
      permissions: [],
    });
    await expect(service.me(99)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
