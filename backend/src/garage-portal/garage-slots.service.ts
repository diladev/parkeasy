import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, type Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  Booking,
  type BookingSource,
  type WalkInPaymentMethod,
} from 'src/booking/entities/booking.entity';
import { formatDinars } from 'src/common/money';
import { TranslationService } from 'src/i18n/translation.service';
import {
  ParkingSlot,
  type SlotStatus,
} from 'src/parking/entities/parking-slot.entity';
import { compareLevels } from 'src/parking/levels';
import { walkInCharge } from 'src/parking/pricing';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { GaragePortalService, type OwnedGarage } from './garage-portal.service';
import {
  checkSlotAction,
  SLOT_ACTION_FROM,
  SLOT_ACTION_TARGET,
  type SlotAction,
} from './slot-actions';

/** The booking or walk-in holding a slot right now. Customers appear by name only. */
export interface SlotBooking {
  id: number;
  source: BookingSource;
  start_time: Date;
  /** The booked end; null for a walk-in, which has none. */
  end_time: Date | null;
  total_cost: number;
  payment_method: string;
  price_per_hour: number;
  customer: { id: number; name: string } | null;
  vehicle: { brand: string; model: string; license_plate: string } | null;
  /** A walk-in's plate. */
  plate: string | null;
  /** A walk-in: what it would pay if it left now. null for app bookings (paid ahead). */
  charge_now: { hours: number; amount: number } | null;
}

export interface LiveSlot {
  id: number;
  level: string;
  slot_number: string;
  status: Exclude<SlotStatus, 'unavailable'>;
  booking: SlotBooking | null;
}

/** GET /garage/garages/:id/slots */
export interface LiveSlots {
  garage: OwnedGarage;
  /** Top floor first, the order of the tabs. */
  levels: string[];
  slots: LiveSlot[];
}

/**
 * The Live Slots page: every slot of one owned garage, blocking slots, and
 * walk-ins (cars that park without the app, charged at the exit).
 */
@Injectable()
export class GarageSlotsService {
  constructor(
    @InjectModel(ParkingSlot) private readonly slotModel: typeof ParkingSlot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly portal: GaragePortalService,
    private readonly translationService: TranslationService,
  ) {}

  async liveSlots(
    ownerId: number,
    lotId: number,
    now = new Date(),
  ): Promise<LiveSlots> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const [slots, bookings] = await Promise.all([
      this.slotModel.findAll({
        attributes: ['id', 'level', 'slot_number', 'status'],
        where: { parking_lot_id: lot.id, status: { [Op.ne]: 'unavailable' } },
      }),
      this.activeBookings(lot.id),
    ]);

    const sorted = [...slots].sort(
      (a, b) =>
        compareLevels(a.level, b.level) ||
        a.slot_number.localeCompare(b.slot_number, 'en', { numeric: true }),
    );
    return {
      garage: this.portal.toOwned(lot),
      levels: [...new Set(sorted.map((slot) => slot.level))],
      slots: sorted.map((slot) => this.present(slot, bookings, now)),
    };
  }

  /**
   * Blocks or releases a slot. The UPDATE itself checks the status it starts
   * from, so a driver booking the slot at the same moment can't be overruled.
   */
  async changeSlot(
    ownerId: number,
    lotId: number,
    slotId: number,
    action: SlotAction,
  ): Promise<{ message: string; slot: LiveSlot }> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const target = SLOT_ACTION_TARGET[action];

    // A slot held by a driver's booking or a walk-in is never changed here.
    // No booking can start meanwhile: bookings and walk-ins only take 'free' slots.
    const held = await this.bookingModel.findOne({
      attributes: ['source'],
      where: {
        parking_lot_id: lot.id,
        parking_slot_id: slotId,
        status: 'active',
      },
    });
    if (held) {
      throw new ConflictException(
        this.t(
          held.source === 'walk_in'
            ? 'PARKING_SLOT_WALK_IN'
            : 'PARKING_SLOT_BOOKED',
        ),
      );
    }

    const [changed] = await this.slotModel.update(
      { status: target },
      {
        where: {
          id: slotId,
          parking_lot_id: lot.id,
          status: { [Op.in]: SLOT_ACTION_FROM[action] },
        },
      },
    );

    const slot = await this.findSlot(lot.id, slotId);
    if (changed === 0) {
      const check = checkSlotAction(slot.status, action);
      if (check === 'booked') {
        throw new ConflictException(this.t('PARKING_SLOT_BOOKED'));
      }
      if (check === 'occupied') {
        throw new ConflictException(this.t('PARKING_SLOT_OCCUPIED'));
      }
      // 'unchanged': already done, e.g. from another tab. Answer as if it worked.
    }

    return {
      message: this.t(
        action === 'block' ? 'PARKING_SLOT_BLOCKED' : 'PARKING_SLOT_RELEASED',
        { slot: slotName(slot) },
      ),
      slot: await this.liveSlot(lot.id, slot),
    };
  }

  // ------------------------------------------------------------- walk-ins

  /**
   * A car parked without the app: the slot becomes occupied and the clock
   * starts at the garage's current hourly price. The slot must be free, checked
   * in the UPDATE itself, so a driver booking it at the same moment wins or loses
   * cleanly.
   */
  async startWalkIn(
    ownerId: number,
    lotId: number,
    slotId: number,
    plate: string,
    now = new Date(),
  ): Promise<{ message: string; slot: LiveSlot }> {
    const lot = await this.portal.ownedLot(ownerId, lotId);

    await this.sequelize.transaction(async (transaction) => {
      const [taken] = await this.slotModel.update(
        { status: 'occupied' },
        {
          where: { id: slotId, parking_lot_id: lot.id, status: 'free' },
          transaction,
        },
      );
      if (taken === 0) {
        await this.findSlot(lot.id, slotId, transaction); // 404 if it doesn't exist
        throw new ConflictException(this.t('PARKING_SLOT_NOT_FREE'));
      }
      await this.bookingModel.create(
        {
          source: 'walk_in',
          status: 'active',
          plate,
          user_id: null,
          vehicle_id: null,
          parking_lot_id: lot.id,
          parking_slot_id: slotId,
          start_time: now,
          end_time: null,
          // Nothing to cancel for free: it's paid at the exit.
          cancellable_until: now,
          duration_hours: 0,
          price_per_hour: lot.price_per_hour,
          total_cost: 0,
          payment_method: 'cash',
        },
        { transaction },
      );
    });

    const slot = await this.findSlot(lot.id, slotId);
    return {
      message: this.t('WALK_IN_STARTED', { slot: slotName(slot), plate }),
      slot: await this.liveSlot(lot.id, slot, now),
    };
  }

  /** The car left: charge every started hour, record how it paid, free the slot. */
  async endWalkIn(
    ownerId: number,
    lotId: number,
    bookingId: number,
    paymentMethod: WalkInPaymentMethod,
    now = new Date(),
  ): Promise<{
    message: string;
    slot: LiveSlot;
    charge: { hours: number; amount: number };
  }> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const walkIn = await this.activeWalkIn(lot.id, bookingId);
    const charge = walkInCharge(walkIn.price_per_hour, walkIn.start_time, now);

    await this.closeWalkIn(
      walkIn,
      {
        status: 'completed',
        duration_hours: charge.hours,
        total_cost: charge.amount,
        payment_method: paymentMethod,
      },
      now,
    );

    const slot = await this.findSlot(lot.id, walkIn.parking_slot_id);
    return {
      message: this.t('WALK_IN_ENDED', {
        plate: walkIn.plate,
        slot: slotName(slot),
        amount: formatDinars(charge.amount),
        method: this.t(paymentMethod === 'cash' ? 'PAID_CASH' : 'PAID_CARD'),
      }),
      slot: await this.liveSlot(lot.id, slot, now),
      charge,
    };
  }

  /** Entered by mistake (wrong slot, wrong car): remove it with no charge. */
  async removeWalkIn(
    ownerId: number,
    lotId: number,
    bookingId: number,
    now = new Date(),
  ): Promise<{ message: string; slot: LiveSlot }> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const walkIn = await this.activeWalkIn(lot.id, bookingId);
    await this.closeWalkIn(walkIn, { status: 'cancelled', total_cost: 0 }, now);

    const slot = await this.findSlot(lot.id, walkIn.parking_slot_id);
    return {
      message: this.t('WALK_IN_REMOVED', { slot: slotName(slot) }),
      slot: await this.liveSlot(lot.id, slot, now),
    };
  }

  private async activeWalkIn(lotId: number, bookingId: number) {
    const walkIn = await this.bookingModel.findOne({
      where: { id: bookingId, parking_lot_id: lotId, source: 'walk_in' },
    });
    if (!walkIn) {
      throw new NotFoundException(this.t('WALK_IN_NOT_FOUND'));
    }
    if (walkIn.status !== 'active') {
      throw new ConflictException(this.t('WALK_IN_ALREADY_ENDED'));
    }
    return walkIn;
  }

  /**
   * Ends a walk-in and frees its slot together. Only while it's still active,
   * checked in the UPDATE, so two clicks (or two tabs) can't charge twice.
   */
  private async closeWalkIn(
    walkIn: Booking,
    changes: Partial<
      Pick<
        Booking,
        'status' | 'duration_hours' | 'total_cost' | 'payment_method'
      >
    >,
    now: Date,
  ): Promise<void> {
    await this.sequelize.transaction(async (transaction) => {
      const [closed] = await this.bookingModel.update(
        { ...changes, ended_at: now, end_time: now },
        { where: { id: walkIn.id, status: 'active' }, transaction },
      );
      if (closed === 0) {
        throw new ConflictException(this.t('WALK_IN_ALREADY_ENDED'));
      }
      await this.slotModel.update(
        { status: 'free' },
        {
          where: { id: walkIn.parking_slot_id, status: 'occupied' },
          transaction,
        },
      );
    });
  }

  // ------------------------------------------------------------- helpers

  private async findSlot(
    lotId: number,
    slotId: number,
    transaction?: Transaction,
  ): Promise<ParkingSlot> {
    const slot = await this.slotModel.findOne({
      where: { id: slotId, parking_lot_id: lotId },
      transaction,
    });
    if (!slot || slot.status === 'unavailable') {
      throw new NotFoundException(this.t('PARKING_SLOT_NOT_FOUND'));
    }
    return slot;
  }

  /** One slot as the page shows it, with its booking or walk-in. */
  private async liveSlot(
    lotId: number,
    slot: ParkingSlot,
    now = new Date(),
  ): Promise<LiveSlot> {
    return this.present(slot, await this.activeBookings(lotId, slot.id), now);
  }

  /** Active bookings and walk-ins of the lot (or of one slot), by slot id. */
  private async activeBookings(
    lotId: number,
    slotId?: number,
  ): Promise<Map<number, Booking>> {
    const bookings = await this.bookingModel.findAll({
      where: {
        parking_lot_id: lotId,
        status: 'active',
        ...(slotId !== undefined && { parking_slot_id: slotId }),
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
          required: false,
          paranoid: false,
        },
        {
          model: Vehicle,
          attributes: ['brand', 'model', 'license_plate'],
          required: false,
          paranoid: false,
        },
      ],
    });
    return new Map(
      bookings.map((booking) => [booking.parking_slot_id, booking]),
    );
  }

  private present(
    slot: ParkingSlot,
    bookings: Map<number, Booking>,
    now: Date,
  ): LiveSlot {
    const booking = bookings.get(slot.id);
    return {
      id: slot.id,
      level: slot.level,
      slot_number: slot.slot_number,
      status: slot.status as LiveSlot['status'],
      booking: booking
        ? {
            id: booking.id,
            source: booking.source,
            start_time: booking.start_time,
            end_time: booking.end_time,
            total_cost: booking.total_cost,
            payment_method: booking.payment_method,
            price_per_hour: booking.price_per_hour,
            customer: booking.user
              ? { id: booking.user.id, name: booking.user.name }
              : null,
            vehicle: booking.vehicle
              ? {
                  brand: booking.vehicle.brand,
                  model: booking.vehicle.model,
                  license_plate: booking.vehicle.license_plate,
                }
              : null,
            plate: booking.plate,
            charge_now:
              booking.source === 'walk_in'
                ? walkInCharge(booking.price_per_hour, booking.start_time, now)
                : null,
          }
        : null,
    };
  }

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }
}

/** "B1 · A04" */
function slotName(slot: ParkingSlot): string {
  return `${slot.level} · ${slot.slot_number}`;
}
