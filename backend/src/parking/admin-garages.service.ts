import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, type Includeable, type WhereOptions } from 'sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import type { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { User } from 'src/users/entities/user.entity';
import { AdminGaragesQueryDto } from './dtos';
import { ParkingLot } from './entities/parking-lot.entity';
import {
  GARAGE_STATUSES,
  nextGarageStatus,
  type GarageAction,
  type GarageStatus,
} from './garage-status';
import { ParkingService, type SlotCounts } from './parking.service';

const DAY = 24 * 60 * 60 * 1000;
const REVENUE_DAYS = 30;

/** One row of the Admin Panel's Garages table. Amounts are whole dinars. */
export interface AdminGarageRow {
  id: number;
  name: string;
  city: string;
  address: string;
  status: GarageStatus;
  /** 0 until drivers have rated it. */
  rating: number;
  total_slots: number;
  /** Paid bookings (active or completed) that started in the last 30 days. */
  revenue_30d: number;
  owner: { id: number; name: string; email: string } | null;
  created_at: Date;
}

export type GarageCounts = Record<'all' | GarageStatus, number>;

/** The usual paginated list, plus how many garages each status filter would show. */
export type AdminGarageList = PaginationResult<AdminGarageRow> & {
  counts: GarageCounts;
};

const SUCCESS_MESSAGE: Record<GarageAction, string> = {
  approve: 'GARAGE_APPROVED',
  suspend: 'GARAGE_SUSPENDED',
  restore: 'GARAGE_RESTORED',
};

/** "50%_off" -> "50\%\_off", so LIKE treats the user's text literally. */
const escapeLike = (text: string) => text.replace(/[\\%_]/g, '\\$&');

@Injectable()
export class AdminGaragesService {
  private readonly logger = new Logger(AdminGaragesService.name);
  private readonly pagination = new ModelPagination(
    ParkingLot,
    '/admin/garages',
  );

  constructor(
    @InjectModel(ParkingLot) private readonly lotModel: typeof ParkingLot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    private readonly parkingService: ParkingService,
    private readonly translationService: TranslationService,
  ) {}

  async list(query: AdminGaragesQueryDto): Promise<AdminGarageList> {
    const q = query.q || undefined;
    const owner: Includeable = {
      model: User,
      as: 'owner',
      attributes: ['id', 'name', 'email'],
      required: false,
    };
    // Removed lots (is_available = false) are gone from the admin list as well.
    const matching: WhereOptions = { is_available: true };
    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      Object.assign(matching, {
        [Op.or]: [
          { name: { [Op.like]: pattern } },
          { city: { [Op.like]: pattern } },
          { address: { [Op.like]: pattern } },
          { '$owner.name$': { [Op.like]: pattern } },
        ],
      });
    }

    const [page, counts] = await Promise.all([
      this.pagination.findAll(
        query.page,
        query.pageSize,
        {
          where: query.status
            ? { ...matching, status: query.status }
            : matching,
          include: [owner],
          order: [
            ['name', 'ASC'],
            ['id', 'ASC'],
          ],
          // The owner join must sit next to the WHERE that searches its name.
          subQuery: false,
        },
        { status: query.status, q },
      ),
      this.countByStatus(matching, owner),
    ]);

    const ids = page.data.map((lot) => lot.id);
    const [slots, revenue] = await Promise.all([
      this.parkingService.countSlots(ids),
      this.revenueLast30Days(ids),
    ]);

    return {
      ...page,
      data: page.data.map((lot) => this.toRow(lot, slots, revenue)),
      counts,
    };
  }

  /**
   * Approve, suspend or restore. The UPDATE only matches the status we read,
   * so two admins acting at once can't both "win" with stale information.
   */
  async changeStatus(
    id: number,
    action: GarageAction,
    adminId: number,
  ): Promise<{ id: number; status: GarageStatus; message: string }> {
    const lot = await this.parkingService.getManagedLot(id);
    const next = nextGarageStatus(lot.status, action);
    if (!next) throw this.statusChanged();

    const [changed] = await this.lotModel.update(
      { status: next },
      { where: { id, status: lot.status, is_available: true } },
    );
    if (changed === 0) throw this.statusChanged();

    // Who changed what, for the server log (no personal data beyond ids).
    this.logger.log(
      `Admin ${adminId}: ${action} garage ${id} (${lot.status} -> ${next})`,
    );
    return {
      id,
      status: next,
      message: this.translationService.translate(
        `message.${SUCCESS_MESSAGE[action]}`,
      ),
    };
  }

  // ---------------------------------------------------------------- helpers

  private statusChanged(): ConflictException {
    return new ConflictException(
      this.translationService.translate('message.GARAGE_STATUS_CHANGED'),
    );
  }

  private async countByStatus(
    matching: WhereOptions,
    owner: Includeable,
  ): Promise<GarageCounts> {
    const rows = (await this.lotModel.findAll({
      attributes: ['status', [fn('COUNT', col('ParkingLot.id')), 'count']],
      where: matching,
      include: [{ ...(owner as object), attributes: [] }],
      group: ['ParkingLot.status'],
      raw: true,
    })) as unknown as { status: GarageStatus; count: number | string }[];

    const counts: GarageCounts = {
      all: 0,
      pending: 0,
      approved: 0,
      suspended: 0,
    };
    for (const row of rows) {
      if (!GARAGE_STATUSES.includes(row.status)) continue;
      counts[row.status] = Number(row.count);
      counts.all += Number(row.count);
    }
    return counts;
  }

  private async revenueLast30Days(
    lotIds: number[],
  ): Promise<Map<number, number>> {
    const revenue = new Map<number, number>();
    if (lotIds.length === 0) return revenue;

    const rows = (await this.bookingModel.findAll({
      attributes: ['parking_lot_id', [fn('SUM', col('total_cost')), 'revenue']],
      where: {
        parking_lot_id: lotIds,
        status: { [Op.in]: ['active', 'completed'] },
        start_time: { [Op.gte]: new Date(Date.now() - REVENUE_DAYS * DAY) },
      },
      group: ['parking_lot_id'],
      raw: true,
    })) as unknown as {
      parking_lot_id: number;
      revenue: number | string | null;
    }[];

    for (const row of rows) {
      revenue.set(row.parking_lot_id, Number(row.revenue ?? 0));
    }
    return revenue;
  }

  private toRow(
    lot: ParkingLot,
    slots: Map<number, SlotCounts>,
    revenue: Map<number, number>,
  ): AdminGarageRow {
    return {
      id: lot.id,
      name: lot.name,
      city: lot.city,
      address: lot.address,
      status: lot.status,
      rating: lot.rating,
      total_slots: slots.get(lot.id)?.total ?? 0,
      revenue_30d: revenue.get(lot.id) ?? 0,
      owner: lot.owner
        ? { id: lot.owner.id, name: lot.owner.name, email: lot.owner.email }
        : null,
      created_at: lot.createdAt as Date,
    };
  }
}
