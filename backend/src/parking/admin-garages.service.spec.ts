import { ConflictException, NotFoundException } from '@nestjs/common';

import type { Booking } from 'src/booking/entities/booking.entity';
import type { TranslationService } from 'src/i18n/translation.service';
import { AdminGaragesService } from './admin-garages.service';
import type { ParkingLot } from './entities/parking-lot.entity';
import type { ParkingSlot } from './entities/parking-slot.entity';
import type { GarageStatus } from './garage-status';
import type { ParkingService } from './parking.service';

describe('AdminGaragesService.changeStatus', () => {
  let stored: { id: number; status: GarageStatus } | null;
  let updates: { status: GarageStatus; where: Record<string, unknown> }[];
  let updateMatches: boolean;
  let service: AdminGaragesService;

  beforeEach(() => {
    stored = { id: 7, status: 'pending' };
    updates = [];
    updateMatches = true;

    const parkingService = {
      getManagedLot: (id: number) =>
        stored && stored.id === id
          ? Promise.resolve(stored)
          : Promise.reject(new NotFoundException('PARKING_NOT_FOUND')),
    } as unknown as ParkingService;
    const lotModel = {
      update: (
        values: { status: GarageStatus },
        options: { where: Record<string, unknown> },
      ) => {
        updates.push({ status: values.status, where: options.where });
        return Promise.resolve([updateMatches ? 1 : 0]);
      },
    } as unknown as typeof ParkingLot;
    const translations = {
      translate: (key: string) => key,
    } as unknown as TranslationService;

    service = new AdminGaragesService(
      lotModel,
      {} as typeof ParkingSlot,
      {} as typeof Booking,
      parkingService,
      translations,
    );
  });

  it('approves a pending garage', async () => {
    await expect(service.changeStatus(7, 'approve', 1)).resolves.toEqual({
      id: 7,
      status: 'approved',
      message: 'message.GARAGE_APPROVED',
    });
    // Only matches the status that was read: a concurrent change makes it a no-op.
    expect(updates).toEqual([
      {
        status: 'approved',
        where: { id: 7, status: 'pending', is_available: true },
      },
    ]);
  });

  it('suspends an approved garage and restores it', async () => {
    stored = { id: 7, status: 'approved' };
    await expect(service.changeStatus(7, 'suspend', 1)).resolves.toMatchObject({
      status: 'suspended',
    });
    stored = { id: 7, status: 'suspended' };
    await expect(service.changeStatus(7, 'restore', 1)).resolves.toMatchObject({
      status: 'approved',
    });
  });

  it('refuses an action that does not fit the current status', async () => {
    await expect(service.changeStatus(7, 'suspend', 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(updates).toEqual([]);
  });

  it('refuses when someone else changed it in the meantime', async () => {
    updateMatches = false;
    await expect(service.changeStatus(7, 'approve', 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('answers 404 for a removed or unknown garage', async () => {
    await expect(service.changeStatus(99, 'approve', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
