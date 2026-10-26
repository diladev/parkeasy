import { ConflictException, NotFoundException } from '@nestjs/common';

import type { Booking } from 'src/booking/entities/booking.entity';
import { UniqueConstraintError } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import type { TranslationService } from 'src/i18n/translation.service';
import type { UsersService } from 'src/users/users.service';
import { AdminGaragesService } from './admin-garages.service';
import type { AdminCreateGarageDto } from './dtos';
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
      {} as Sequelize,
      parkingService,
      {} as UsersService,
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

describe('AdminGaragesService.create', () => {
  const TX = Symbol('transaction');
  let createdLots: { values: Record<string, unknown>; transaction: unknown }[];
  let createdSlots: {
    level: string;
    slot_number: string;
    [key: string]: unknown;
  }[];
  let ownerLookup: jest.Mock;
  let service: AdminGaragesService;

  const dto = (overrides: Partial<AdminCreateGarageDto> = {}) => ({
    name: 'Zagros Park Deck',
    address: 'Salim Street',
    city: 'Sulaymaniyah',
    latitude: 35.56,
    longitude: 45.43,
    is_open_24h: true,
    opening_time: '00:00',
    closing_time: '00:00',
    price_per_hour: 1500,
    has_cctv: true,
    has_ev_charging: false,
    is_covered: true,
    is_accessible: false,
    levels: [
      { level: 'G', slots: 2 },
      { level: 'B1', slots: 3 },
    ],
    ...overrides,
  });

  beforeEach(() => {
    createdLots = [];
    createdSlots = [];
    ownerLookup = jest.fn();

    const lotModel = {
      create: (
        values: Record<string, unknown>,
        options: { transaction: unknown },
      ) => {
        createdLots.push({ values, transaction: options.transaction });
        return Promise.resolve({ id: 42 });
      },
    } as unknown as typeof ParkingLot;
    const slotModel = {
      bulkCreate: (
        rows: typeof createdSlots,
        options: { transaction: unknown },
      ) => {
        expect(options.transaction).toBe(TX);
        createdSlots.push(...rows);
        return Promise.resolve(rows);
      },
    } as unknown as typeof ParkingSlot;
    const sequelize = {
      transaction: <T>(work: (transaction: unknown) => Promise<T>) => work(TX),
    } as unknown as Sequelize;
    const usersService = {
      findOrCreateGarageOwner: ownerLookup,
    } as unknown as UsersService;
    const translations = {
      translate: (key: string, options?: { args?: Record<string, unknown> }) =>
        options?.args ? `${key} ${JSON.stringify(options.args)}` : key,
    } as unknown as TranslationService;

    service = new AdminGaragesService(
      lotModel,
      slotModel,
      {} as typeof Booking,
      sequelize,
      {} as ParkingService,
      usersService,
      translations,
    );
  });

  it('adds an approved garage without an owner and numbers its slots per level', async () => {
    await expect(service.create(dto(), 1)).resolves.toEqual({
      id: 42,
      message: 'message.GARAGE_CREATED',
    });
    expect(createdLots).toHaveLength(1);
    expect(createdLots[0].transaction).toBe(TX);
    expect(createdLots[0].values).toMatchObject({
      name: 'Zagros Park Deck',
      status: 'approved',
      owner_id: null,
    });
    // levels and owner are not lot columns.
    expect(createdLots[0].values).not.toHaveProperty('levels');
    expect(createdLots[0].values).not.toHaveProperty('owner');
    expect(
      createdSlots.map((slot) => `${slot.level}-${slot.slot_number}`),
    ).toEqual(['G-A01', 'G-A02', 'B1-A01', 'B1-A02', 'B1-A03']);
    expect(
      createdSlots.every(
        (slot) => slot.parking_lot_id === 42 && slot.status === 'free',
      ),
    ).toBe(true);
    expect(ownerLookup).not.toHaveBeenCalled();
  });

  it('links an existing garage owner', async () => {
    ownerLookup.mockResolvedValue({
      user: { id: 9, email: 'hana@example.com' },
      created: false,
    });
    const owner = {
      name: 'Hana Rauf',
      email: 'hana@example.com',
      phone: '+964 750 200 0005',
    };

    await expect(service.create(dto({ owner }), 1)).resolves.toEqual({
      id: 42,
      message: 'message.GARAGE_CREATED',
    });
    expect(ownerLookup).toHaveBeenCalledWith(owner, TX);
    expect(createdLots[0].values).toMatchObject({ owner_id: 9 });
  });

  it('says so when a new owner account was opened', async () => {
    ownerLookup.mockResolvedValue({
      user: { id: 31, email: 'new@example.com' },
      created: true,
    });

    const saved = await service.create(
      dto({
        owner: {
          name: 'New Owner',
          email: 'new@example.com',
          phone: '0750 111 2233',
        },
      }),
      1,
    );
    expect(saved.message).toBe(
      'message.GARAGE_CREATED_NEW_OWNER {"email":"new@example.com"}',
    );
    expect(createdLots[0].values).toMatchObject({ owner_id: 31 });
  });

  it('creates nothing when the owner email belongs to another kind of account', async () => {
    ownerLookup.mockRejectedValue(
      new ConflictException('GARAGE_OWNER_NOT_ELIGIBLE'),
    );

    await expect(
      service.create(
        dto({
          owner: {
            name: 'Lana',
            email: 'lana@example.com',
            phone: '0750 111 2233',
          },
        }),
        1,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(createdLots).toEqual([]);
    expect(createdSlots).toEqual([]);
  });

  it('turns a unique-index race into a 409', async () => {
    ownerLookup.mockRejectedValue(new UniqueConstraintError({}));

    await expect(
      service.create(
        dto({
          owner: { name: 'A', email: 'a@example.com', phone: '0750 111 2233' },
        }),
        1,
      ),
    ).rejects.toThrow('message.GARAGE_SAVE_CONFLICT');
  });
});
