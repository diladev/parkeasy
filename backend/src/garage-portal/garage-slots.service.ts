import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import { TranslationService } from 'src/i18n/translation.service';
import {
  ParkingSlot,
  type SlotStatus,
} from 'src/parking/entities/parking-slot.entity';
import { compareLevels } from 'src/parking/levels';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { GaragePortalService, type OwnedGarage } from './garage-portal.service';
import {
  checkSlotAction,
  SLOT_ACTION_FROM,
  SLOT_ACTION_TARGET,
  type SlotAction,
} from './slot-actions';

/** The booking holding a slot right now. Customers appear by name only. */
export interface SlotBooking {
  id: number;
  start_time: Date;
  end_time: Date;
  total_cost: number;
  payment_method: string;
  customer: { id: number; name: string } | null;
  vehicle: { brand: string; model: string; license_plate: string } | null;
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

/** The Live Slots page: every slot of one owned garage, and blocking slots. */
@Injectable()
export class GarageSlotsService {
  constructor(
    @InjectModel(ParkingSlot) private readonly slotModel: typeof ParkingSlot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    private readonly portal: GaragePortalService,
    private readonly translationService: TranslationService,
  ) {}

  async liveSlots(ownerId: number, lotId: number): Promise<LiveSlots> {
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
      slots: sorted.map((slot) => this.present(slot, bookings)),
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

    // Today a booked slot is 'reserved', which no action starts from. Once a
    // gate or sensor marks booked cars 'occupied', this keeps them safe too.
    // No booking can start meanwhile: bookings only take 'free' slots.
    const held = await this.bookingModel.count({
      where: {
        parking_lot_id: lot.id,
        parking_slot_id: slotId,
        status: 'active',
      },
    });
    if (held > 0) {
      throw new ConflictException(this.t('PARKING_SLOT_BOOKED'));
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

    const slot = await this.slotModel.findOne({
      where: { id: slotId, parking_lot_id: lot.id },
    });
    if (!slot || slot.status === 'unavailable') {
      throw new NotFoundException(this.t('PARKING_SLOT_NOT_FOUND'));
    }
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

    const bookings = await this.activeBookings(lot.id, slot.id);
    return {
      message: this.t(
        action === 'block' ? 'PARKING_SLOT_BLOCKED' : 'PARKING_SLOT_RELEASED',
        { slot: `${slot.level} · ${slot.slot_number}` },
      ),
      slot: this.present(slot, bookings),
    };
  }

  /** Active bookings of the lot (or of one slot), by slot id. */
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

  private present(slot: ParkingSlot, bookings: Map<number, Booking>): LiveSlot {
    const booking = bookings.get(slot.id);
    return {
      id: slot.id,
      level: slot.level,
      slot_number: slot.slot_number,
      status: slot.status as LiveSlot['status'],
      booking: booking
        ? {
            id: booking.id,
            start_time: booking.start_time,
            end_time: booking.end_time,
            total_cost: booking.total_cost,
            payment_method: booking.payment_method,
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
          }
        : null,
    };
  }

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }
}
