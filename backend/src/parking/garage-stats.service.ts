import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op } from 'sequelize';

import {
  Booking,
  type BookingStatus,
} from 'src/booking/entities/booking.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { OUT_OF_SERVICE, ParkingSlot } from './entities/parking-slot.entity';
import { compareLevels } from './levels';

/** Bookings that were paid for and not refunded. */
export const PAID_BOOKINGS: BookingStatus[] = ['active', 'completed'];

export interface LevelOccupancy {
  level: string;
  total: number;
  /** Reserved or occupied right now. */
  taken: number;
}

/** One booking in a garage's list. No phone or email: only what the page shows. */
export interface GarageBookingRow {
  id: number;
  status: BookingStatus;
  /** Completed before its booked end time (the driver ended parking early). */
  ended_early: boolean;
  start_time: Date;
  end_time: Date;
  total_cost: number;
  customer: { id: number; name: string } | null;
  vehicle: { brand: string; model: string; license_plate: string } | null;
  slot: { level: string; slot_number: string } | null;
}

/**
 * Figures about one garage, shared by the Admin Panel's garage page and the
 * Garage Portal's dashboard, so both always count the same way.
 */
@Injectable()
export class GarageStatsService {
  constructor(
    @InjectModel(ParkingSlot) private readonly slotModel: typeof ParkingSlot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
  ) {}

  /** Slots in service per level, top floor first. */
  async slotsByLevel(lotId: number): Promise<LevelOccupancy[]> {
    const rows = (await this.slotModel.findAll({
      attributes: ['level', 'status', [fn('COUNT', col('id')), 'count']],
      where: {
        parking_lot_id: lotId,
        status: { [Op.notIn]: OUT_OF_SERVICE },
      },
      group: ['level', 'status'],
      raw: true,
    })) as unknown as {
      level: string;
      status: string;
      count: number | string;
    }[];

    const levels = new Map<string, LevelOccupancy>();
    for (const row of rows) {
      const entry = levels.get(row.level) ?? {
        level: row.level,
        total: 0,
        taken: 0,
      };
      entry.total += Number(row.count);
      if (row.status === 'reserved' || row.status === 'occupied') {
        entry.taken += Number(row.count);
      }
      levels.set(row.level, entry);
    }
    return [...levels.values()].sort((a, b) => compareLevels(a.level, b.level));
  }

  /** Paid bookings that started in [from, to). */
  async revenueBetween(lotId: number, from: Date, to: Date): Promise<number> {
    if (to <= from) return 0;
    const total = await this.bookingModel.sum('total_cost', {
      where: {
        parking_lot_id: lotId,
        status: { [Op.in]: PAID_BOOKINGS },
        start_time: { [Op.gte]: from, [Op.lt]: to },
      },
    });
    return Number(total ?? 0);
  }

  /** Paid bookings that started in [from, to), for per-day figures. */
  paidBookingsBetween(
    lotId: number,
    from: Date,
    to: Date,
  ): Promise<Pick<Booking, 'start_time' | 'total_cost'>[]> {
    return this.bookingModel.findAll({
      attributes: ['start_time', 'total_cost'],
      where: {
        parking_lot_id: lotId,
        status: { [Op.in]: PAID_BOOKINGS },
        start_time: { [Op.gte]: from, [Op.lt]: to },
      },
      raw: true,
    });
  }

  /** The latest bookings, newest first. */
  async recentBookings(
    lotId: number,
    limit: number,
  ): Promise<GarageBookingRow[]> {
    const bookings = await this.bookingModel.findAll({
      where: { parking_lot_id: lotId },
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
        {
          model: ParkingSlot,
          attributes: ['level', 'slot_number'],
          required: false,
          paranoid: false,
        },
      ],
      order: [
        ['start_time', 'DESC'],
        ['id', 'DESC'],
      ],
      limit,
    });

    return bookings.map((booking) => ({
      id: booking.id,
      status: booking.status,
      ended_early:
        booking.status === 'completed' &&
        booking.ended_at !== null &&
        booking.ended_at.getTime() < booking.end_time.getTime(),
      start_time: booking.start_time,
      end_time: booking.end_time,
      total_cost: booking.total_cost,
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
      slot: booking.parking_slot
        ? {
            level: booking.parking_slot.level,
            slot_number: booking.parking_slot.slot_number,
          }
        : null,
    }));
  }

  /**
   * Bookings running now, and how many of them end within `soonMinutes`, so
   * the owner knows which slots free up shortly.
   */
  async activeBookings(
    lotId: number,
    now: Date,
    soonMinutes: number,
  ): Promise<{ active: number; ending_soon: number }> {
    const soon = new Date(now.getTime() + soonMinutes * 60_000);
    const [active, endingSoon] = await Promise.all([
      this.bookingModel.count({
        where: {
          parking_lot_id: lotId,
          status: 'active',
          end_time: { [Op.gt]: now },
        },
      }),
      this.bookingModel.count({
        where: {
          parking_lot_id: lotId,
          status: 'active',
          end_time: { [Op.gt]: now, [Op.lte]: soon },
        },
      }),
    ]);
    return { active, ending_soon: endingSoon };
  }

  /**
   * Average stay, in whole minutes, of the completed bookings that started in
   * [from, to): until they ended, or their booked end. null when there were none.
   */
  async averageStayMinutes(
    lotId: number,
    from: Date,
    to: Date,
  ): Promise<number | null> {
    const bookings = await this.bookingModel.findAll({
      attributes: ['start_time', 'end_time', 'ended_at'],
      where: {
        parking_lot_id: lotId,
        status: 'completed',
        start_time: { [Op.gte]: from, [Op.lt]: to },
      },
      raw: true,
    });
    return averageMinutes(bookings);
  }
}

/** Mean of (ended_at or end_time) - start_time, in whole minutes; null for none. */
export function averageMinutes(
  stays: { start_time: Date; end_time: Date; ended_at: Date | null }[],
): number | null {
  if (stays.length === 0) return null;
  const total = stays.reduce((sum, stay) => {
    const end = new Date(stay.ended_at ?? stay.end_time).getTime();
    return sum + (end - new Date(stay.start_time).getTime());
  }, 0);
  return Math.round(total / stays.length / 60_000);
}
