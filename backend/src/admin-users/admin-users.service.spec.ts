import { ConflictException, NotFoundException } from '@nestjs/common';

import type { AuthService } from 'src/auth/auth.service';
import type { Booking } from 'src/booking/entities/booking.entity';
import type { TranslationService } from 'src/i18n/translation.service';
import type { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import type { User } from 'src/users/entities/user.entity';
import type { Vehicle } from 'src/users/entities/vehicle.entity';
import type { Wallet } from 'src/wallet/entities/wallet.entity';
import type { WalletTransaction } from 'src/wallet/entities/wallet-transaction.entity';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService actions', () => {
  let stored: Partial<User> | null;
  let updates: {
    values: Record<string, unknown>;
    where: Record<string, unknown>;
  }[];
  let updateMatches: boolean;
  let resetFor: Partial<User>[];
  let service: AdminUsersService;

  beforeEach(() => {
    stored = {
      id: 7,
      role: 'driver',
      status: 'active',
      email: 'aram@example.com',
    };
    updates = [];
    updateMatches = true;
    resetFor = [];

    const userModel = {
      findByPk: (id: number) =>
        Promise.resolve(stored && stored.id === id ? stored : null),
      update: (
        values: Record<string, unknown>,
        options: { where: Record<string, unknown> },
      ) => {
        updates.push({ values, where: options.where });
        return Promise.resolve([updateMatches ? 1 : 0]);
      },
    } as unknown as typeof User;
    const authService = {
      sendResetCodeFromAdmin: (user: Partial<User>) => {
        resetFor.push(user);
        return Promise.resolve({ message: 'message.RESET_CODE_SENT_TO' });
      },
    } as unknown as AuthService;
    const translations = {
      translate: (key: string) => key,
    } as unknown as TranslationService;

    service = new AdminUsersService(
      userModel,
      {} as typeof Vehicle,
      {} as typeof Booking,
      {} as typeof Wallet,
      {} as typeof WalletTransaction,
      {} as typeof ParkingLot,
      authService,
      translations,
    );
  });

  it('suspends an account and ends its sessions and reset codes', async () => {
    await expect(service.changeStatus(7, 'suspend', 1)).resolves.toEqual({
      id: 7,
      status: 'suspended',
      message: 'message.USER_SUSPENDED',
    });
    expect(updates).toEqual([
      {
        values: {
          status: 'suspended',
          refresh_token_hash: null,
          otp_hash: null,
          otp_expires_at: null,
          otp_attempts: 0,
        },
        // Only matches the status that was read: a concurrent change makes it a no-op.
        where: { id: 7, status: 'active' },
      },
    ]);
  });

  it('restores a suspended account without touching anything else', async () => {
    stored = { ...stored, status: 'suspended' };
    await expect(service.changeStatus(7, 'restore', 1)).resolves.toMatchObject({
      status: 'active',
    });
    expect(updates[0].values).toEqual({ status: 'active' });
  });

  it('never suspends an admin', async () => {
    stored = { ...stored, role: 'admin' };
    await expect(service.changeStatus(7, 'suspend', 1)).rejects.toThrow(
      'message.ADMIN_NOT_SUSPENDABLE',
    );
    expect(updates).toEqual([]);
  });

  it('refuses an action that does not fit, or lost a race', async () => {
    await expect(service.changeStatus(7, 'restore', 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    updateMatches = false;
    await expect(service.changeStatus(7, 'suspend', 1)).rejects.toThrow(
      'message.USER_STATUS_CHANGED',
    );
  });

  it('answers 404 for an unknown account', async () => {
    await expect(service.changeStatus(99, 'suspend', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.sendPasswordReset(99, 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('sends a reset code to the account', async () => {
    await expect(service.sendPasswordReset(7, 1)).resolves.toEqual({
      message: 'message.RESET_CODE_SENT_TO',
    });
    expect(resetFor).toEqual([stored]);
  });
});
