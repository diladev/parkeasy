import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { dailyRevenue } from 'src/common/daily-revenue';
import { addDays, iraqDayStart } from 'src/common/iraq-time';
import { TranslationService } from 'src/i18n/translation.service';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import type { GarageStatus } from 'src/parking/garage-status';
import {
  GarageStatsService,
  type GarageBookingRow,
  type LevelOccupancy,
} from 'src/parking/garage-stats.service';

const CHART_DAYS = 7;
const RECENT_BOOKINGS = 5;
/** "Ending soon" on the dashboard: within this many minutes. */
const ENDING_SOON_MINUTES = 30;

/** One of the owner's garages, for the garage switcher. */
export interface OwnedGarage {
  id: number;
  name: string;
  city: string;
  status: GarageStatus;
}

/** GET /garage/garages/:id/dashboard. Amounts are whole dinars; days are Iraq days. */
export interface GarageDashboard {
  garage: OwnedGarage;
  /** Slots in service; taken = reserved or occupied right now. */
  occupancy: { taken: number; total: number };
  revenue_today: { today: number; yesterday: number };
  active_bookings: { active: number; ending_soon: number };
  /** Average stay in minutes of completed bookings; null without any. */
  average_stay: { last_7_days: number | null; previous_7_days: number | null };
  revenue_days: { date: string; amount: number }[];
  levels: LevelOccupancy[];
  recent_bookings: GarageBookingRow[];
}

/**
 * The Garage Portal's data. Every query is limited to garages the signed-in
 * owner owns: someone else's garage answers 404, exactly like one that doesn't
 * exist, so ids can't be probed.
 */
@Injectable()
export class GaragePortalService {
  constructor(
    @InjectModel(ParkingLot) private readonly lotModel: typeof ParkingLot,
    private readonly stats: GarageStatsService,
    private readonly translationService: TranslationService,
  ) {}

  async myGarages(ownerId: number): Promise<OwnedGarage[]> {
    const lots = await this.lotModel.findAll({
      attributes: ['id', 'name', 'city', 'status'],
      where: { owner_id: ownerId, is_available: true },
      order: [
        ['name', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return lots.map((lot) => this.toOwned(lot));
  }

  async dashboard(
    ownerId: number,
    lotId: number,
    now = new Date(),
  ): Promise<GarageDashboard> {
    const lot = await this.ownedLot(ownerId, lotId);
    const today = iraqDayStart(now);
    const chartStart = addDays(today, -(CHART_DAYS - 1));
    const weekAgo = addDays(now, -7);

    const [
      levels,
      revenueToday,
      revenueYesterday,
      active,
      stayThisWeek,
      stayLastWeek,
      chartBookings,
      recent,
    ] = await Promise.all([
      this.stats.slotsByLevel(lot.id),
      this.stats.revenueBetween(lot.id, today, addDays(today, 1)),
      this.stats.revenueBetween(lot.id, addDays(today, -1), today),
      this.stats.activeBookings(lot.id, now, ENDING_SOON_MINUTES),
      this.stats.averageStayMinutes(lot.id, weekAgo, now),
      this.stats.averageStayMinutes(lot.id, addDays(now, -14), weekAgo),
      this.stats.paidBookingsBetween(lot.id, chartStart, addDays(today, 1)),
      this.stats.recentBookings(lot.id, RECENT_BOOKINGS),
    ]);

    return {
      garage: this.toOwned(lot),
      occupancy: {
        taken: levels.reduce((sum, level) => sum + level.taken, 0),
        total: levels.reduce((sum, level) => sum + level.total, 0),
      },
      revenue_today: { today: revenueToday, yesterday: revenueYesterday },
      active_bookings: active,
      average_stay: {
        last_7_days: stayThisWeek,
        previous_7_days: stayLastWeek,
      },
      revenue_days: dailyRevenue(chartBookings, chartStart, CHART_DAYS),
      levels,
      recent_bookings: recent,
    };
  }

  /** The owner's garage, or the same 404 as for one that doesn't exist. */
  async ownedLot(ownerId: number, lotId: number): Promise<ParkingLot> {
    const lot = await this.lotModel.findOne({
      where: { id: lotId, owner_id: ownerId, is_available: true },
    });
    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate('message.PARKING_NOT_FOUND'),
      );
    }
    return lot;
  }

  toOwned(lot: ParkingLot): OwnedGarage {
    return { id: lot.id, name: lot.name, city: lot.city, status: lot.status };
  }
}
