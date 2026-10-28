import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, where as whereFn, type WhereOptions } from 'sequelize';

import { AuthService } from 'src/auth/auth.service';
import { ROLES, type Role } from 'src/auth/permissions';
import {
  Booking,
  endedEarly,
  type BookingStatus,
} from 'src/booking/entities/booking.entity';
import type { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { escapeLike } from 'src/common/like';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import {
  WalletTransaction,
  type WalletTransactionCategory,
} from 'src/wallet/entities/wallet-transaction.entity';
import { toCsv } from './csv';
import { AdminUsersExportQueryDto, AdminUsersQueryDto } from './dtos';
import { nextUserStatus, type UserAction } from './user-status';

const DAY = 24 * 60 * 60 * 1000;
/** Bookings that were paid for and not refunded. */
const PAID_BOOKINGS: BookingStatus[] = ['active', 'completed'];
const RECENT_BOOKINGS = 10;
const WALLET_ENTRIES = 5;
/** A CSV export is for a spreadsheet, not a backup: more than this is cut off. */
export const EXPORT_LIMIT = 5000;

/** One row of the Admin Panel's Users table. Amounts are whole dinars. */
export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: string;
  bookings: number;
  wallet_balance: number;
  created_at: Date;
}

export type UserCounts = Record<'all' | Role, number>;

export type AdminUserList = PaginationResult<AdminUserRow> & {
  counts: UserCounts;
};

/** GET /admin/users/:id: everything on the Admin Panel's user page. */
export interface AdminUserDetail {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: string;
  created_at: Date;
  stats: {
    bookings: number;
    bookings_this_week: number;
    cancelled: number;
    /** Paid bookings (active or completed). */
    spent: number;
    wallet_balance: number;
    last_top_up: { amount: number; at: Date } | null;
  };
  vehicles: {
    id: number;
    brand: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    is_default: boolean;
  }[];
  wallet_activity: {
    id: number;
    type: 'credit' | 'debit';
    category: WalletTransactionCategory;
    amount: number;
    at: Date;
    garage: string | null;
  }[];
  recent_bookings: {
    id: number;
    status: BookingStatus;
    ended_early: boolean;
    start_time: Date;
    duration_hours: number;
    total_cost: number;
    garage: { id: number; name: string } | null;
    slot: { level: string; slot_number: string } | null;
  }[];
  /** Garage owners only: the garages they run. */
  garages: { id: number; name: string; city: string; status: string }[];
}

const SUCCESS_MESSAGE: Record<UserAction, string> = {
  suspend: 'USER_SUSPENDED',
  restore: 'USER_RESTORED',
};

/** "2026-10-26" in Iraq time, for the CSV. */
const iraqDate = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Baghdad' }).format(date);

@Injectable()
export class AdminUsersService {
  private readonly logger = new Logger(AdminUsersService.name);
  private readonly pagination = new ModelPagination(User, '/admin/users');

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Vehicle) private readonly vehicleModel: typeof Vehicle,
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    @InjectModel(Wallet) private readonly walletModel: typeof Wallet,
    @InjectModel(WalletTransaction)
    private readonly transactionModel: typeof WalletTransaction,
    @InjectModel(ParkingLot) private readonly lotModel: typeof ParkingLot,
    private readonly authService: AuthService,
    private readonly translationService: TranslationService,
  ) {}

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }

  async list(query: AdminUsersQueryDto): Promise<AdminUserList> {
    const q = query.q || undefined;
    const matching = this.searchWhere(q);

    const [page, counts] = await Promise.all([
      this.pagination.findAll(
        query.page,
        query.pageSize,
        {
          where: query.role ? { ...matching, role: query.role } : matching,
          order: [
            ['createdAt', 'DESC'],
            ['id', 'DESC'],
          ],
        },
        { role: query.role, q },
      ),
      this.countByRole(matching),
    ]);

    return {
      ...page,
      data: await this.toRows(page.data),
      counts,
    };
  }

  /** Every matching account as a CSV file, newest first. */
  async exportCsv(query: AdminUsersExportQueryDto): Promise<string> {
    const matching = this.searchWhere(query.q || undefined);
    const users = await this.userModel.findAll({
      where: query.role ? { ...matching, role: query.role } : matching,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: EXPORT_LIMIT,
    });
    const rows = await this.toRows(users);
    return toCsv(
      [
        'ID',
        'Name',
        'Email',
        'Phone',
        'Role',
        'Status',
        'Bookings',
        'Wallet balance (IQD)',
        'Joined',
      ],
      rows.map((row) => [
        row.id,
        row.name,
        row.email,
        row.phone,
        row.role,
        row.status,
        row.bookings,
        row.wallet_balance,
        iraqDate(row.created_at),
      ]),
    );
  }

  async detail(id: number): Promise<AdminUserDetail> {
    const user = await this.findUser(id);
    const wallet = await this.walletModel.findOne({ where: { user_id: id } });

    const [vehicles, stats, bookings, lastTopUp, activity, garages] =
      await Promise.all([
        this.vehicleModel.findAll({
          where: { user_id: id },
          order: [
            ['is_default', 'DESC'],
            ['id', 'ASC'],
          ],
        }),
        this.bookingStats(id),
        this.recentBookings(id),
        wallet
          ? this.transactionModel.findOne({
              where: { wallet_id: wallet.id, category: 'TOP_UP' },
              order: [
                ['createdAt', 'DESC'],
                ['id', 'DESC'],
              ],
            })
          : null,
        wallet ? this.walletActivity(wallet.id) : [],
        user.role === 'garage_owner'
          ? this.lotModel.findAll({
              where: { owner_id: id, is_available: true },
              attributes: ['id', 'name', 'city', 'status'],
              order: [['name', 'ASC']],
            })
          : Promise.resolve([] as ParkingLot[]),
      ]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      created_at: user.createdAt as Date,
      stats: {
        ...stats,
        wallet_balance: wallet?.balance ?? 0,
        last_top_up: lastTopUp
          ? { amount: lastTopUp.amount, at: lastTopUp.createdAt as Date }
          : null,
      },
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        license_plate: vehicle.license_plate,
        is_default: vehicle.is_default,
      })),
      wallet_activity: activity,
      recent_bookings: bookings,
      garages: garages.map((lot) => ({
        id: lot.id,
        name: lot.name,
        city: lot.city,
        status: lot.status,
      })),
    };
  }

  /**
   * Suspend or restore. Suspending also ends every session (the stored
   * refresh token is cleared) and any reset code, so the person is signed out
   * within one access-token lifetime and can't get back in. Admin accounts are
   * left alone, so the panel can't lock out the people who run it.
   */
  async changeStatus(
    id: number,
    action: UserAction,
    adminId: number,
  ): Promise<{ id: number; status: string; message: string }> {
    const user = await this.findUser(id);
    if (user.role === 'admin') {
      throw new ConflictException(this.t('ADMIN_NOT_SUSPENDABLE'));
    }
    const next = nextUserStatus(user.status, action);
    if (!next) throw this.statusChanged();

    const [changed] = await this.userModel.update(
      {
        status: next,
        ...(action === 'suspend' && {
          refresh_token_hash: null,
          otp_hash: null,
          otp_expires_at: null,
          otp_attempts: 0,
        }),
      },
      { where: { id, status: user.status } },
    );
    if (changed === 0) throw this.statusChanged();

    this.logger.log(
      `Admin ${adminId}: ${action} user ${id} (${user.status} -> ${next})`,
    );
    return { id, status: next, message: this.t(SUCCESS_MESSAGE[action]) };
  }

  /** Emails the same 6-digit code as Forgot password. */
  async sendPasswordReset(
    id: number,
    adminId: number,
  ): Promise<{ message: string }> {
    const user = await this.findUser(id);
    const result = await this.authService.sendResetCodeFromAdmin(user);
    this.logger.log(`Admin ${adminId}: sent a password reset to user ${id}`);
    return result;
  }

  // ---------------------------------------------------------------- helpers

  private async findUser(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException(this.t('USER_NOT_FOUND'));
    return user;
  }

  private statusChanged(): ConflictException {
    return new ConflictException(this.t('USER_STATUS_CHANGED'));
  }

  /**
   * Name, email, username or phone. Phone numbers are stored as typed
   * ("+964 750 100 0001"), so spaces and dashes are ignored on both sides.
   */
  private searchWhere(q: string | undefined): WhereOptions<User> {
    if (!q) return {};
    const pattern = `%${escapeLike(q)}%`;
    const conditions: WhereOptions<User>[] = [
      { name: { [Op.like]: pattern } },
      { email: { [Op.like]: pattern } },
      { username: { [Op.like]: pattern } },
    ];
    const digits = q.replace(/[\s-]/g, '');
    if (/^\+?\d{3,}$/.test(digits)) {
      conditions.push(
        whereFn(fn('REPLACE', fn('REPLACE', col('phone'), ' ', ''), '-', ''), {
          [Op.like]: `%${digits}%`,
        }),
      );
    }
    return { [Op.or]: conditions };
  }

  private async countByRole(matching: WhereOptions<User>): Promise<UserCounts> {
    const rows = (await this.userModel.findAll({
      attributes: ['role', [fn('COUNT', col('id')), 'count']],
      where: matching,
      group: ['role'],
      raw: true,
    })) as unknown as { role: Role; count: number | string }[];

    const counts: UserCounts = { all: 0, driver: 0, garage_owner: 0, admin: 0 };
    for (const row of rows) {
      if (!ROLES.includes(row.role)) continue;
      counts[row.role] = Number(row.count);
      counts.all += Number(row.count);
    }
    return counts;
  }

  /** Adds each user's booking count and wallet balance, two queries for the whole page. */
  private async toRows(users: User[]): Promise<AdminUserRow[]> {
    const ids = users.map((user) => user.id);
    const bookings = new Map<number, number>();
    const balances = new Map<number, number>();

    if (ids.length > 0) {
      const [bookingRows, wallets] = await Promise.all([
        this.bookingModel.findAll({
          attributes: ['user_id', [fn('COUNT', col('id')), 'count']],
          where: { user_id: ids },
          group: ['user_id'],
          raw: true,
        }) as unknown as Promise<{ user_id: number; count: number | string }[]>,
        this.walletModel.findAll({
          attributes: ['user_id', 'balance'],
          where: { user_id: ids },
        }),
      ]);
      for (const row of bookingRows) {
        bookings.set(row.user_id, Number(row.count));
      }
      for (const wallet of wallets)
        balances.set(wallet.user_id, wallet.balance);
    }

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      bookings: bookings.get(user.id) ?? 0,
      wallet_balance: balances.get(user.id) ?? 0,
      created_at: user.createdAt as Date,
    }));
  }

  private async bookingStats(userId: number) {
    const weekAgo = new Date(Date.now() - 7 * DAY);
    const [bookings, thisWeek, cancelled, spent] = await Promise.all([
      this.bookingModel.count({ where: { user_id: userId } }),
      this.bookingModel.count({
        where: { user_id: userId, start_time: { [Op.gte]: weekAgo } },
      }),
      this.bookingModel.count({
        where: { user_id: userId, status: 'cancelled' },
      }),
      this.bookingModel.sum('total_cost', {
        where: { user_id: userId, status: { [Op.in]: PAID_BOOKINGS } },
      }),
    ]);
    return {
      bookings,
      bookings_this_week: thisWeek,
      cancelled,
      spent: Number(spent ?? 0),
    };
  }

  private async recentBookings(
    userId: number,
  ): Promise<AdminUserDetail['recent_bookings']> {
    const bookings = await this.bookingModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: ParkingLot,
          attributes: ['id', 'name'],
          required: false,
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
      ended_early: endedEarly(booking),
      start_time: booking.start_time,
      duration_hours: booking.duration_hours,
      total_cost: booking.total_cost,
      garage: booking.parking_lot
        ? { id: booking.parking_lot.id, name: booking.parking_lot.name }
        : null,
      slot: booking.parking_slot
        ? {
            level: booking.parking_slot.level,
            slot_number: booking.parking_slot.slot_number,
          }
        : null,
    }));
  }

  private async walletActivity(
    walletId: number,
  ): Promise<AdminUserDetail['wallet_activity']> {
    const entries = await this.transactionModel.findAll({
      where: { wallet_id: walletId },
      include: [
        {
          model: Booking,
          attributes: ['id'],
          required: false,
          include: [
            { model: ParkingLot, attributes: ['name'], required: false },
          ],
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: WALLET_ENTRIES,
    });

    return entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      category: entry.category,
      amount: entry.amount,
      at: entry.createdAt as Date,
      garage: entry.booking?.parking_lot?.name ?? null,
    }));
  }
}
