import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import {
  col,
  fn,
  Op,
  UniqueConstraintError,
  type Includeable,
  type WhereOptions,
} from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  Booking,
  type BookingStatus,
} from 'src/booking/entities/booking.entity';
import type { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { UsersService } from 'src/users/users.service';
import {
  AdminCreateGarageDto,
  AdminGaragesQueryDto,
  UpdateParkingLotDto,
} from './dtos';
import { ParkingLot } from './entities/parking-lot.entity';
import { ParkingSlot } from './entities/parking-slot.entity';
import {
  GARAGE_STATUSES,
  nextGarageStatus,
  type GarageAction,
  type GarageStatus,
} from './garage-status';
import { compareLevels, slotNumbers } from './levels';
import { ParkingService, type SlotCounts } from './parking.service';

const DAY = 24 * 60 * 60 * 1000;
const REVENUE_DAYS = 30;
/** How many bookings the detail page lists. */
const RECENT_BOOKINGS = 10;
/** Bookings that were paid for and not refunded. */
const PAID_BOOKINGS: BookingStatus[] = ['active', 'completed'];

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

/** One booking on the detail page. Only what an admin needs: no phone or email. */
export interface AdminGarageBooking {
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

/** GET /admin/garages/:id: everything on the Admin Panel's garage page. */
export interface AdminGarageDetail {
  id: number;
  name: string;
  address: string;
  city: string;
  status: GarageStatus;
  rating: number;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  is_open_24h: boolean;
  opening_time: string;
  closing_time: string;
  free_cancellation_minutes: number;
  amenities: {
    cctv: boolean;
    ev_charging: boolean;
    covered: boolean;
    accessible: boolean;
  };
  owner: { id: number; name: string; email: string } | null;
  created_at: Date;
  /** Slots in service; taken = reserved or occupied right now. */
  slots: {
    total: number;
    taken: number;
    levels: { level: string; total: number; taken: number }[];
  };
  /** Paid bookings by start time: the last 30 days and the 30 before. */
  revenue: { last_30_days: number; previous_30_days: number };
  recent_bookings: AdminGarageBooking[];
}

/** What POST /admin/garages and PATCH /admin/garages/:id answer. */
export interface AdminGarageSaved {
  id: number;
  /** Already translated, ready for a toast. */
  message: string;
}

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
    @InjectModel(ParkingSlot)
    private readonly slotModel: typeof ParkingSlot,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly parkingService: ParkingService,
    private readonly usersService: UsersService,
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

  /** One garage with its settings, occupancy, revenue and latest bookings. */
  async detail(id: number): Promise<AdminGarageDetail> {
    const lot = await this.lotModel.findOne({
      where: { id, is_available: true },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
          required: false,
        },
      ],
    });
    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate('message.PARKING_NOT_FOUND'),
      );
    }

    const now = Date.now();
    const [levels, last30, previous30, bookings] = await Promise.all([
      this.slotsByLevel(id),
      this.revenueBetween(id, now - REVENUE_DAYS * DAY, now),
      this.revenueBetween(
        id,
        now - 2 * REVENUE_DAYS * DAY,
        now - REVENUE_DAYS * DAY,
      ),
      this.recentBookings(id),
    ]);

    return {
      id: lot.id,
      name: lot.name,
      address: lot.address,
      city: lot.city,
      status: lot.status,
      rating: lot.rating,
      latitude: lot.latitude,
      longitude: lot.longitude,
      price_per_hour: lot.price_per_hour,
      is_open_24h: lot.is_open_24h,
      opening_time: lot.opening_time,
      closing_time: lot.closing_time,
      free_cancellation_minutes: lot.free_cancellation_minutes,
      amenities: {
        cctv: lot.has_cctv,
        ev_charging: lot.has_ev_charging,
        covered: lot.is_covered,
        accessible: lot.is_accessible,
      },
      owner: lot.owner
        ? { id: lot.owner.id, name: lot.owner.name, email: lot.owner.email }
        : null,
      created_at: lot.createdAt as Date,
      slots: {
        total: levels.reduce((sum, level) => sum + level.total, 0),
        taken: levels.reduce((sum, level) => sum + level.taken, 0),
        levels,
      },
      revenue: { last_30_days: last30, previous_30_days: previous30 },
      recent_bookings: bookings,
    };
  }

  /**
   * Adds a garage with its levels and slots, and links or opens its owner's
   * account, all in one transaction: a failure leaves nothing half-made.
   * An admin vetted it, so it is approved and bookable straight away.
   */
  async create(
    dto: AdminCreateGarageDto,
    adminId: number,
  ): Promise<AdminGarageSaved> {
    const { levels, owner, ...details } = dto;

    try {
      const { id, newOwner } = await this.sequelize.transaction(
        async (transaction) => {
          const account = owner
            ? await this.usersService.findOrCreateGarageOwner(
                owner,
                transaction,
              )
            : null;
          const lot = await this.lotModel.create(
            {
              ...details,
              status: 'approved',
              owner_id: account?.user.id ?? null,
            },
            { transaction },
          );
          await this.slotModel.bulkCreate(
            levels.flatMap(({ level, slots }) =>
              slotNumbers(slots).map((slot_number) => ({
                parking_lot_id: lot.id,
                level,
                slot_number,
                status: 'free',
              })),
            ),
            { transaction },
          );
          return {
            id: lot.id,
            newOwner: account?.created ? account.user : null,
          };
        },
      );

      this.logger.log(
        `Admin ${adminId}: added garage ${id}` +
          (newOwner ? ` with new owner account ${newOwner.id}` : ''),
      );
      return {
        id,
        message: newOwner
          ? this.translationService.translate(
              'message.GARAGE_CREATED_NEW_OWNER',
              { args: { email: newOwner.email } },
            )
          : this.translationService.translate('message.GARAGE_CREATED'),
      };
    } catch (error) {
      // Two admins adding the same new owner at once: the unique email index decides.
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException(
          this.translationService.translate('message.GARAGE_SAVE_CONFLICT'),
        );
      }
      throw error;
    }
  }

  /** Edits the garage's details. Levels, slots and the owner don't change here. */
  async update(
    id: number,
    dto: UpdateParkingLotDto,
    adminId: number,
  ): Promise<AdminGarageSaved> {
    await this.parkingService.updateLot(id, dto);
    this.logger.log(
      `Admin ${adminId}: edited garage ${id} (${Object.keys(dto).join(', ')})`,
    );
    return {
      id,
      message: this.translationService.translate('message.GARAGE_UPDATED'),
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

  private async slotsByLevel(
    lotId: number,
  ): Promise<{ level: string; total: number; taken: number }[]> {
    const rows = (await this.slotModel.findAll({
      attributes: ['level', 'status', [fn('COUNT', col('id')), 'count']],
      where: { parking_lot_id: lotId, status: { [Op.ne]: 'unavailable' } },
      group: ['level', 'status'],
      raw: true,
    })) as unknown as {
      level: string;
      status: string;
      count: number | string;
    }[];

    const levels = new Map<
      string,
      { level: string; total: number; taken: number }
    >();
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

  private async revenueBetween(
    lotId: number,
    from: number,
    to: number,
  ): Promise<number> {
    const total = await this.bookingModel.sum('total_cost', {
      where: {
        parking_lot_id: lotId,
        status: { [Op.in]: PAID_BOOKINGS },
        start_time: { [Op.gte]: new Date(from), [Op.lt]: new Date(to) },
      },
    });
    return Number(total ?? 0);
  }

  private async recentBookings(lotId: number): Promise<AdminGarageBooking[]> {
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
      limit: RECENT_BOOKINGS,
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

  private async revenueLast30Days(
    lotIds: number[],
  ): Promise<Map<number, number>> {
    const revenue = new Map<number, number>();
    if (lotIds.length === 0) return revenue;

    const rows = (await this.bookingModel.findAll({
      attributes: ['parking_lot_id', [fn('SUM', col('total_cost')), 'revenue']],
      where: {
        parking_lot_id: lotIds,
        status: { [Op.in]: PAID_BOOKINGS },
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
