import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Sequelize } from 'sequelize-typescript';

import type { Booking } from 'src/booking/entities/booking.entity';
import type { TranslationService } from 'src/i18n/translation.service';
import type { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import type { GaragePortalService } from './garage-portal.service';
import { GarageSlotsService } from './garage-slots.service';

type Slot = { id: number; level: string; slot_number: string; status: string };
type Row = Partial<Booking> & Record<string, unknown>;

/** Plain objects standing in for rows, with just the WHERE shapes this service uses. */
function matches(row: Record<string, unknown>, where: Record<string, unknown>) {
  return Object.entries(where).every(([key, wanted]) => {
    if (wanted === undefined) return true;
    if (wanted !== null && typeof wanted === 'object') {
      const [op] = Object.getOwnPropertySymbols(wanted);
      const value = (wanted as Record<symbol, unknown>)[op];
      if (Array.isArray(value)) return value.includes(row[key]); // Op.in
      return row[key] !== value; // Op.ne
    }
    return row[key] === wanted;
  });
}

describe('GarageSlotsService', () => {
  const LOT = {
    id: 5,
    name: 'City Center Parking',
    city: 'Sulaymaniyah',
    price_per_hour: 1500,
  };
  const NOW = new Date('2026-10-27T10:00:00Z');
  let slots: Slot[];
  let bookings: Row[];
  let service: GarageSlotsService;

  beforeEach(() => {
    slots = [
      { id: 1, level: 'G', slot_number: 'A10', status: 'free' },
      { id: 2, level: 'B1', slot_number: 'A01', status: 'reserved' },
      { id: 3, level: 'G', slot_number: 'A02', status: 'occupied' },
      { id: 4, level: 'F1', slot_number: 'A01', status: 'blocked' },
      { id: 5, level: 'G', slot_number: 'A01', status: 'unavailable' },
      { id: 6, level: 'G', slot_number: 'A03', status: 'occupied' },
    ].map((slot) => ({ ...slot, parking_lot_id: 5 }));
    bookings = [
      {
        id: 40,
        source: 'app',
        status: 'active',
        parking_lot_id: 5,
        parking_slot_id: 2,
        start_time: new Date('2026-10-27T09:00:00Z'),
        end_time: new Date('2026-10-27T11:00:00Z'),
        total_cost: 3000,
        price_per_hour: 1500,
        payment_method: 'wallet',
        plate: null,
        user: { id: 9, name: 'Aram Hassan' } as Booking['user'],
        vehicle: null as unknown as Booking['vehicle'],
      },
      {
        // Parked 70 minutes ago without the app: 2 started hours so far.
        id: 41,
        source: 'walk_in',
        status: 'active',
        parking_lot_id: 5,
        parking_slot_id: 6,
        start_time: new Date('2026-10-27T08:50:00Z'),
        end_time: null,
        total_cost: 0,
        price_per_hour: 1500,
        payment_method: 'cash',
        plate: '22 SUL 555',
        user: null as unknown as Booking['user'],
        vehicle: null as unknown as Booking['vehicle'],
      },
    ];

    const slotModel = {
      findAll: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(slots.filter((slot) => matches(slot, where))),
      findOne: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(slots.find((slot) => matches(slot, where)) ?? null),
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
      findAll: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(bookings.filter((b) => matches(b, where))),
      findOne: ({ where }: { where: Record<string, unknown> }) =>
        Promise.resolve(bookings.find((b) => matches(b, where)) ?? null),
      create: (values: Row) => {
        const row = {
          id: 50 + bookings.length,
          user: null,
          vehicle: null,
          ...values,
        } as Row;
        bookings.push(row);
        return Promise.resolve(row);
      },
      update: (values: Row, { where }: { where: Record<string, unknown> }) => {
        const hits = bookings.filter((b) => matches(b, where));
        hits.forEach((b) => Object.assign(b, values));
        return Promise.resolve([hits.length]);
      },
    } as unknown as typeof Booking;

    const sequelize = {
      transaction: (work: (t: unknown) => Promise<unknown>) => work({}),
    } as unknown as Sequelize;

    const portal = {
      ownedLot: (ownerId: number, lotId: number) =>
        ownerId === 6 && lotId === 5
          ? Promise.resolve(LOT)
          : Promise.reject(new NotFoundException('PARKING_NOT_FOUND')),
      toOwned: (lot: typeof LOT) => ({ ...lot, status: 'approved' }),
    } as unknown as GaragePortalService;

    const translations = {
      translate: (key: string, options?: { args?: Record<string, string> }) =>
        options?.args ? `${key}:${Object.values(options.args).join('|')}` : key,
    } as unknown as TranslationService;

    service = new GarageSlotsService(
      slotModel,
      bookingModel,
      sequelize,
      portal,
      translations,
    );
  });

  it('lists the slots top floor first, in number order, with their bookings', async () => {
    const live = await service.liveSlots(6, 5, NOW);
    expect(live.levels).toEqual(['F1', 'G', 'B1']);
    expect(
      live.slots.map((s) => `${s.level}:${s.slot_number}:${s.status}`),
    ).toEqual([
      'F1:A01:blocked',
      'G:A02:occupied',
      'G:A03:occupied',
      'G:A10:free',
      'B1:A01:reserved',
    ]);
    expect(live.slots[4].booking).toMatchObject({
      id: 40,
      source: 'app',
      customer: { name: 'Aram Hassan' },
      payment_method: 'wallet',
      charge_now: null,
    });
    expect(live.slots[0].booking).toBeNull();
  });

  it("shows a walk-in's plate and what it would pay now", async () => {
    const live = await service.liveSlots(6, 5, NOW);
    expect(live.slots[2].booking).toMatchObject({
      source: 'walk_in',
      plate: '22 SUL 555',
      customer: null,
      charge_now: { hours: 2, amount: 3000 },
    });
  });

  it("refuses someone else's garage", async () => {
    await expect(service.liveSlots(7, 5)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.changeSlot(7, 5, 1, 'block')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.startWalkIn(7, 5, 1, '22 SUL 1'),
    ).rejects.toBeInstanceOf(NotFoundException);
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

  it('frees a slot a car without any record has left', async () => {
    const released = await service.changeSlot(6, 5, 3, 'release');
    expect(released.slot.status).toBe('free');
  });

  it("never touches a driver's booking or a walk-in from the slot actions", async () => {
    await expect(service.changeSlot(6, 5, 2, 'release')).rejects.toThrow(
      new ConflictException('message.PARKING_SLOT_BOOKED'),
    );
    await expect(service.changeSlot(6, 5, 2, 'block')).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(service.changeSlot(6, 5, 6, 'release')).rejects.toThrow(
      new ConflictException('message.PARKING_SLOT_WALK_IN'),
    );
    expect(slots[1].status).toBe('reserved');
    expect(slots[5].status).toBe('occupied');
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

  describe('walk-ins', () => {
    it('starts on a free slot at the current hourly price', async () => {
      const started = await service.startWalkIn(6, 5, 1, '22 SUL 777', NOW);
      expect(started.message).toBe(
        'message.WALK_IN_STARTED:G · A10|22 SUL 777',
      );
      expect(started.slot.status).toBe('occupied');
      expect(started.slot.booking).toMatchObject({
        source: 'walk_in',
        plate: '22 SUL 777',
        end_time: null,
        charge_now: { hours: 1, amount: 1500 },
      });
      expect(bookings.at(-1)).toMatchObject({
        user_id: null,
        vehicle_id: null,
        price_per_hour: 1500,
        total_cost: 0,
      });
    });

    it('only takes a free slot', async () => {
      await expect(service.startWalkIn(6, 5, 2, '22 SUL 777')).rejects.toThrow(
        new ConflictException('message.PARKING_SLOT_NOT_FREE'),
      );
      await expect(
        service.startWalkIn(6, 5, 4, '22 SUL 777'),
      ).rejects.toBeInstanceOf(ConflictException);
      await expect(
        service.startWalkIn(6, 5, 5, '22 SUL 777'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('charges every started hour at the exit and frees the slot', async () => {
      const ended = await service.endWalkIn(6, 5, 41, 'card', NOW);
      expect(ended.charge).toEqual({ hours: 2, amount: 3000 });
      expect(ended.message).toBe(
        'message.WALK_IN_ENDED:22 SUL 555|G · A03|3,000 IQD|message.PAID_CARD',
      );
      expect(ended.slot).toMatchObject({ status: 'free', booking: null });
      expect(bookings[1]).toMatchObject({
        status: 'completed',
        total_cost: 3000,
        duration_hours: 2,
        payment_method: 'card',
        ended_at: NOW,
        end_time: NOW,
      });
    });

    it('charges only once', async () => {
      await service.endWalkIn(6, 5, 41, 'cash', NOW);
      await expect(service.endWalkIn(6, 5, 41, 'cash', NOW)).rejects.toThrow(
        new ConflictException('message.WALK_IN_ALREADY_ENDED'),
      );
    });

    it('removes one entered by mistake, without a charge', async () => {
      const removed = await service.removeWalkIn(6, 5, 41, NOW);
      expect(removed.slot.status).toBe('free');
      expect(bookings[1]).toMatchObject({ status: 'cancelled', total_cost: 0 });
    });

    it("can't end a driver's app booking", async () => {
      await expect(service.endWalkIn(6, 5, 40, 'cash')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(bookings[0].status).toBe('active');
    });
  });
});
