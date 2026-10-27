import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import type { Role } from 'src/auth/permissions';
import {
  Booking,
  type BookingStatus,
} from 'src/booking/entities/booking.entity';
import { dailyRevenue } from 'src/common/daily-revenue';
import { addDays, iraqDayStart, iraqMonthStart } from 'src/common/iraq-time';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { User } from 'src/users/entities/user.entity';

/** Bookings that were paid for and not refunded, as on the Garages pages. */
const PAID_BOOKINGS: BookingStatus[] = ['active', 'completed'];
const CHART_DAYS = 7;
const TOP_GARAGES = 5;
const RECENT_SIGNUPS = 5;

/** GET /admin/overview: the Admin Panel's first page. Amounts are whole dinars. */
export interface AdminOverview {
  users: { total: number; new_this_month: number };
  garages: { total: number; pending: number };
  /** Bookings starting today and yesterday (Iraq time), cancelled ones left out. */
  bookings_today: { today: number; yesterday: number };
  /** This month so far, and the same stretch of last month, to compare like with like. */
  revenue_month: { to_date: number; previous_to_date: number };
  /** The last 7 Iraq days, oldest first, today last. Days without revenue are 0. */
  revenue_days: { date: string; amount: number }[];
  /** The garages that took the most over those 7 days. */
  top_garages: { id: number; name: string; city: string; revenue: number }[];
  recent_signups: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: Role;
    status: string;
    created_at: Date;
  }[];
}

@Injectable()
export class AdminOverviewService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(ParkingLot) private readonly lotModel: typeof ParkingLot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
  ) {}

  async overview(now = new Date()): Promise<AdminOverview> {
    const today = iraqDayStart(now);
    const monthStart = iraqMonthStart(now);
    const lastMonthStart = iraqMonthStart(now, 1);
    // The same number of days and hours into last month, but never past its end.
    const lastMonthSoFar = new Date(
      Math.min(
        lastMonthStart.getTime() + (now.getTime() - monthStart.getTime()),
        monthStart.getTime(),
      ),
    );
    const chartStart = addDays(today, -(CHART_DAYS - 1));

    const [
      totalUsers,
      newUsers,
      totalGarages,
      pendingGarages,
      bookingsToday,
      bookingsYesterday,
      revenueToDate,
      revenuePrevious,
      weekBookings,
      signups,
    ] = await Promise.all([
      this.userModel.count(),
      this.userModel.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
      this.lotModel.count({ where: { is_available: true } }),
      this.lotModel.count({ where: { is_available: true, status: 'pending' } }),
      this.countBookingsBetween(today, addDays(today, 1)),
      this.countBookingsBetween(addDays(today, -1), today),
      this.revenueBetween(monthStart, now),
      this.revenueBetween(lastMonthStart, lastMonthSoFar),
      this.bookingModel.findAll({
        attributes: ['start_time', 'total_cost', 'parking_lot_id'],
        where: {
          status: { [Op.in]: PAID_BOOKINGS },
          start_time: { [Op.gte]: chartStart, [Op.lt]: addDays(today, 1) },
        },
        raw: true,
      }),
      this.userModel.findAll({
        order: [
          ['createdAt', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: RECENT_SIGNUPS,
      }),
    ]);

    return {
      users: { total: totalUsers, new_this_month: newUsers },
      garages: { total: totalGarages, pending: pendingGarages },
      bookings_today: { today: bookingsToday, yesterday: bookingsYesterday },
      revenue_month: {
        to_date: revenueToDate,
        previous_to_date: revenuePrevious,
      },
      revenue_days: dailyRevenue(weekBookings, chartStart, CHART_DAYS),
      top_garages: await this.topGarages(weekBookings),
      recent_signups: signups.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        created_at: user.createdAt as Date,
      })),
    };
  }

  private countBookingsBetween(from: Date, to: Date): Promise<number> {
    return this.bookingModel.count({
      where: {
        status: { [Op.ne]: 'cancelled' },
        start_time: { [Op.gte]: from, [Op.lt]: to },
      },
    });
  }

  private async revenueBetween(from: Date, to: Date): Promise<number> {
    if (to <= from) return 0;
    const total = await this.bookingModel.sum('total_cost', {
      where: {
        status: { [Op.in]: PAID_BOOKINGS },
        start_time: { [Op.gte]: from, [Op.lt]: to },
      },
    });
    return Number(total ?? 0);
  }

  private async topGarages(
    bookings: Pick<Booking, 'parking_lot_id' | 'total_cost'>[],
  ): Promise<AdminOverview['top_garages']> {
    const totals = new Map<number, number>();
    for (const booking of bookings) {
      totals.set(
        booking.parking_lot_id,
        (totals.get(booking.parking_lot_id) ?? 0) + Number(booking.total_cost),
      );
    }
    const top = [...totals.entries()]
      .sort((a, b) => b[1] - a[1] || a[0] - b[0])
      .slice(0, TOP_GARAGES);
    if (top.length === 0) return [];

    // Removed lots stay in the ranking: their revenue was real.
    const lots = await this.lotModel.findAll({
      attributes: ['id', 'name', 'city'],
      where: { id: top.map(([id]) => id) },
    });
    const byId = new Map(lots.map((lot) => [lot.id, lot]));
    return top.flatMap(([id, revenue]) => {
      const lot = byId.get(id);
      return lot ? [{ id, name: lot.name, city: lot.city, revenue }] : [];
    });
  }
}
