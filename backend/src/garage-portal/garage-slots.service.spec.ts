import { ConflictException, NotFoundException } from '@nestjs/common';

import type { Booking } from 'src/booking/entities/booking.entity';
import type { TranslationService } from 'src/i18n/translation.service';
import type { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import type { GaragePortalService } from './garage-portal.service';
import { GarageSlotsService } from './garage-slots.service';

type Slot = { id: number; level: string; slot_number: string; status: string };

describe('GarageSlotsService', () => {
  const LOT = { id: 5, name: 'City Center Parking', city: 'Sulaymaniyah' };
  let slots: Slot[];
  let activeBookings: Partial<Booking>[];
  let service: GarageSlotsService;

  beforeEach(() => {
    slots = [
      { id: 1, level: 'G', slot_number: 'A10', status: 'free' },
      { id: 2, level: 'B1', slot_number: 'A01', status: 'reserved' },
      { id: 3, level: 'G', slot_number: 'A02', status: 'occupied' },
      { id: 4, level: 'F1', slot_number: 'A01', status: 'blocked' },
      { id: 5, level: 'G', slot_number: 'A01', status: 'unavailable' },
    ];
    activeBookings = [
      {
        id: 40,
        parking_slot_id: 2,
        start_time: new Date('2026-10-27T09:00:00Z'),
        end_time: new Date('2026-10-27T11:00:00Z'),
        total_cost: 3000,
        payment_method: 'wallet',
        user: { id: 9, name: 'Aram Hassan' } as Booking['user'],
        vehicle: null as unknown as Booking['vehicle'],
      },
    ];

    const matches = (slot: Slot, where: Record<string, unknown>) => {
      if (where.id !== undefined && slot.id !== where.id) return false;
      const status = where.status as
        Record<symbol, unknown> | string | undefined;
      if (typeof status === 'string') return slot.status === status;
      if (status) {
        const [op] = Object.getOwnPropertySymbols(status);
        const value = status[op];
        if (Array.isArray(value)) return value.includes(slot.status);
        return slot.status !== value; // Op.ne
      }
      return true;
    };

    const slotModel = {
      findAll: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(slots.filter((slot) => matches(slot, where))),
      findOne: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(slots.find((slot) => slot.id === where.id) ?? null),
      update: (
        values: { status: string },
        { where }: { where: Record<string, unknown> },
      ) => {
        const hits = slots.filter((slot) => matches(slot, where));
        hits.forEach((slot) => (slot.status = values.status));
        return Promise.resolve([hits.length]);
      },
    } as unknown as typeof ParkingSlot;

    const bookingModel = {
      findAll: ({ where }: { where: { parking_slot_id?: number } }) =>
        Promise.resolve(
          activeBookings.filter(
            (b) =>
              where.parking_slot_id === undefined ||
              b.parking_slot_id === where.parking_slot_id,
          ),
        ),
      count: ({ where }: { where: { parking_slot_id: number } }) =>
        Promise.resolve(
          activeBookings.filter(
            (b) => b.parking_slot_id === where.parking_slot_id,
          ).length,
        ),
    } as unknown as typeof Booking;

    const portal = {
      ownedLot: (ownerId: number, lotId: number) =>
        ownerId === 6 && lotId === 5
          ? Promise.resolve(LOT)
          : Promise.reject(new NotFoundException('PARKING_NOT_FOUND')),
      toOwned: (lot: typeof LOT) => ({ ...lot, status: 'approved' }),
    } as unknown as GaragePortalService;

    const translations = {
      translate: (key: string, options?: { args?: { slot?: string } }) =>
        options?.args?.slot ? `${key}:${options.args.slot}` : key,
    } as unknown as TranslationService;

    service = new GarageSlotsService(
      slotModel,
      bookingModel,
      portal,
      translations,
    );
  });

  it('lists the slots top floor first, in number order, with their bookings', async () => {
    const live = await service.liveSlots(6, 5);
    expect(live.levels).toEqual(['F1', 'G', 'B1']);
    expect(
      live.slots.map((s) => `${s.level}:${s.slot_number}:${s.status}`),
    ).toEqual([
      'F1:A01:blocked',
      'G:A02:occupied',
      'G:A10:free',
      'B1:A01:reserved',
    ]);
    expect(live.slots[3].booking).toMatchObject({
      id: 40,
      customer: { name: 'Aram Hassan' },
      payment_method: 'wallet',
    });
    expect(live.slots[0].booking).toBeNull();
  });

  it("refuses someone else's garage", async () => {
    await expect(service.liveSlots(7, 5)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.changeSlot(7, 5, 1, 'block')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(slots[0].status).toBe('free');
  });

  it('blocks a free slot and puts it back', async () => {
    const blocked = await service.changeSlot(6, 5, 1, 'block');
    expect(blocked.slot.status).toBe('blocked');
    expect(blocked.message).toBe('message.PARKING_SLOT_BLOCKED:G · A10');

    const released = await service.changeSlot(6, 5, 1, 'release');
    expect(released.slot.status).toBe('free');
    expect(released.message).toBe('message.PARKING_SLOT_RELEASED:G · A10');
  });

  it('frees a slot after a walk-in car has left', async () => {
    const released = await service.changeSlot(6, 5, 3, 'release');
    expect(released.slot.status).toBe('free');
  });

  it("never touches a driver's booked slot", async () => {
    await expect(service.changeSlot(6, 5, 2, 'release')).rejects.toThrow(
      new ConflictException('message.PARKING_SLOT_BOOKED'),
    );
    await expect(service.changeSlot(6, 5, 2, 'block')).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(slots[1].status).toBe('reserved');
  });

  it('asks to free a slot with a parked car before blocking it', async () => {
    await expect(service.changeSlot(6, 5, 3, 'block')).rejects.toThrow(
      new ConflictException('message.PARKING_SLOT_OCCUPIED'),
    );
  });

  it('answers calmly when the slot is already as asked', async () => {
    const again = await service.changeSlot(6, 5, 4, 'block');
    expect(again.slot.status).toBe('blocked');
  });

  it('does not find removed slots', async () => {
    await expect(service.changeSlot(6, 5, 5, 'release')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.changeSlot(6, 5, 99, 'block')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
