import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Includeable, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { formatDinars } from 'src/common/money';
import { MailService } from 'src/mail/mail.service';
import { NotificationSettingsService } from 'src/notifications/notification-settings.service';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { isOpenDuring } from 'src/parking/opening-hours';
import { ParkingService } from 'src/parking/parking.service';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { UsersService } from 'src/users/users.service';
import { WalletService } from 'src/wallet/wallet.service';
import { BookingQueryDto, CreateBookingDto, ExtendBookingDto } from './dto';
import { MAX_BOOKING_HOURS } from './dto/create-booking.dto';
import { Booking } from './entities/booking.entity';
import { BookingEndingAlert } from './entities/booking-ending-alert.entity';

const HOUR_MS = 60 * 60 * 1000;
/** Cancelling within this many minutes of the start refunds everything. */
const FREE_CANCELLATION_MINUTES = 10;
/** How often finished bookings are closed and their slots freed. */
const EXPIRY_SWEEP_INTERVAL_MS = 60 * 1000;
/** How long before the end the "ends soon" notice is sent. */
const ENDING_SOON_MINUTES = 15;
/** Times in receipt emails are local: Iraq has one time zone and no daylight saving. */
const RECEIPT_TIME_ZONE = 'Asia/Baghdad';

/** Booking details shown in the app. paranoid: false keeps showing a vehicle that was deleted later. */
/** "PE-000123": a booking's receipt number. */
export const receiptNumber = (bookingId: number) => `PE-${String(bookingId).padStart(6, '0')}`;

/** A booking's receipt, in whole Iraqi dinars. */
export interface BookingReceipt {
  receipt_number: string;
  /** When it was paid (or booked, if it was never charged). */
  issued_at: Date;
  payment_method: Booking['payment_method'];
  /** Everything charged: the booking and its extensions. */
  subtotal: number;
  refunded: number;
  /** What it cost in the end: subtotal minus refunds. */
  total: number;
  booking: Booking;
}

const BOOKING_DETAILS: Includeable[] = [
  { model: ParkingLot, paranoid: false },
  { model: ParkingSlot, paranoid: false },
  { model: Vehicle, paranoid: false },
];

@Injectable()
export class BookingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BookingService.name);
  private readonly pagination = new ModelPagination(Booking, '/booking');
  private sweepTimer?: NodeJS.Timeout;

  constructor(
    @InjectModel(Booking) private readonly bookingModel: typeof Booking,
    @InjectModel(BookingEndingAlert) private readonly endingAlertModel: typeof BookingEndingAlert,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly parkingService: ParkingService,
    private readonly walletService: WalletService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationSettings: NotificationSettingsService,
    private readonly mailService: MailService,
    private readonly translationService: TranslationService,
  ) { }

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }

  // ------------------------------------------------- finishing bookings

  onModuleInit(): void {
    this.sweepTimer = setInterval(() => {
      this.completeExpiredBookings().catch((error: unknown) =>
        this.logger.error('Closing finished bookings failed', error instanceof Error ? error.stack : String(error)),
      );
      this.sendEndingSoonAlerts().catch((error: unknown) =>
        this.logger.error('Sending "ends soon" notices failed', error instanceof Error ? error.stack : String(error)),
      );
    }, EXPIRY_SWEEP_INTERVAL_MS);
    // Don't keep the process alive just for this timer.
    this.sweepTimer.unref();
  }

  onModuleDestroy(): void {
    clearInterval(this.sweepTimer);
  }

  /**
   * Completes active bookings whose end time has passed and frees their slots.
   * Runs every minute, and for one user right before their bookings are read or
   * changed, so the answer is correct even between two runs.
   */
  async completeExpiredBookings(userId?: number): Promise<void> {
    const expired = await this.bookingModel.findAll({
      where: {
        status: 'active',
        end_time: { [Op.lte]: new Date() },
        ...(userId !== undefined && { user_id: userId }),
      },
      include: [{ model: ParkingLot, attributes: ['name'], paranoid: false }],
    });

    for (const booking of expired) {
      await this.sequelize.transaction(async (transaction) => {
        // Only if it's still active: another request may have just cancelled it.
        const [completed] = await this.bookingModel.update(
          { status: 'completed' },
          { where: { id: booking.id, status: 'active' }, transaction },
        );
        if (completed === 0) return;

        await this.parkingService.releaseSlot(booking.parking_slot_id, transaction);
        await this.notificationsService.notify(
          booking.user_id,
          'BOOKING_COMPLETED',
          { lot: booking.parking_lot?.name ?? '' },
          transaction,
        );
      });

      // After the commit, and not awaited: a slow mail server must not hold
      // up the request that happened to close the booking.
      if (await this.bookingWasCompleted(booking.id)) {
        this.emailReceipt(booking.id).catch((error: unknown) =>
          this.logger.error('Emailing a receipt failed', error instanceof Error ? error.stack : String(error)),
        );
      }
    }
  }

  private async bookingWasCompleted(bookingId: number): Promise<boolean> {
    return (await this.bookingModel.count({ where: { id: bookingId, status: 'completed' } })) > 0;
  }

  /**
   * "Your parking ends in N min" for active bookings close to their end, once
   * per end time (an extension gets a new notice), if the user wants them.
   */
  async sendEndingSoonAlerts(now: Date = new Date()): Promise<void> {
    const soon = await this.bookingModel.findAll({
      where: {
        status: 'active',
        end_time: { [Op.gt]: now, [Op.lte]: new Date(now.getTime() + ENDING_SOON_MINUTES * 60_000) },
      },
      include: [{ model: ParkingLot, attributes: ['name'], paranoid: false }],
    });

    for (const booking of soon) {
      if (!(await this.notificationSettings.isEnabled(booking.user_id, 'expiry_alerts'))) continue;

      await this.sequelize.transaction(async (transaction) => {
        const alert = await this.endingAlertModel.findOne({
          where: { booking_id: booking.id },
          transaction,
          lock: Transaction.LOCK.UPDATE,
        });
        if (alert?.end_time.getTime() === booking.end_time.getTime()) return;

        if (alert) {
          await alert.update({ end_time: booking.end_time }, { transaction });
        } else {
          await this.endingAlertModel.create({ booking_id: booking.id, end_time: booking.end_time }, { transaction });
        }
        const minutes = Math.max(1, Math.ceil((booking.end_time.getTime() - now.getTime()) / 60_000));
        await this.notificationsService.notify(
          booking.user_id,
          'BOOKING_ENDING_SOON',
          { lot: booking.parking_lot?.name ?? '', minutes },
          transaction,
        );
      });
    }
  }

  /** Emails a finished booking's receipt, if the user wants receipt emails. */
  private async emailReceipt(bookingId: number): Promise<void> {
    const booking = await this.bookingModel.findByPk(bookingId, {
      include: [...BOOKING_DETAILS, { model: User, attributes: ['name', 'email'] }],
    });
    if (!booking?.user) return;
    if (!(await this.notificationSettings.isEnabled(booking.user_id, 'booking_receipt_emails'))) return;

    const receipt = await this.buildReceipt(booking);
    const time = (date: Date) =>
      date.toLocaleString('en-GB', {
        timeZone: RECEIPT_TIME_ZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

    await this.mailService.sendBookingReceipt(booking.user.email, booking.user.name, {
      receiptNumber: receipt.receipt_number,
      lot: booking.parking_lot?.name ?? '',
      slot: [booking.parking_slot?.slot_number, booking.parking_slot?.level].filter(Boolean).join(' · '),
      entry: time(booking.start_time),
      exit: time(booking.end_time),
      subtotal: formatDinars(receipt.subtotal),
      refunded: receipt.refunded > 0 ? formatDinars(receipt.refunded) : null,
      total: formatDinars(receipt.total),
      paidWith: receipt.payment_method,
    });
  }

  // ------------------------------------------------------------- bookings

  /**
   * Everything happens in one transaction: if any step fails (slot just taken,
   * not enough balance...), nothing is saved and no money is taken.
   */
  async createBooking(userId: number, dto: CreateBookingDto): Promise<{ message: string; booking: Booking }> {
    await this.completeExpiredBookings(userId);

    const bookingId = await this.sequelize.transaction(async (transaction) => {
      await this.usersService.lockForUpdate(userId, transaction);

      const active = await this.bookingModel.findOne({
        where: { user_id: userId, status: 'active' },
        transaction,
      });
      if (active) {
        throw new ConflictException(this.t('BOOKING_ALREADY_ACTIVE'));
      }

      const vehicle = await this.usersService.getVehicle(userId, dto.vehicle_id, transaction);
      const lot = await this.parkingService.getBookableLot(dto.parking_lot_id, transaction);

      const start = new Date();
      const end = new Date(start.getTime() + dto.duration_hours * HOUR_MS);
      if (!isOpenDuring(lot, start, end)) {
        throw new BadRequestException(
          this.t('PARKING_CLOSED_DURING_BOOKING', { opening: lot.opening_time, closing: lot.closing_time }),
        );
      }

      const slot = await this.parkingService.reserveSlot(lot.id, dto.parking_slot_id, transaction);

      const totalCost = lot.price_per_hour * dto.duration_hours;
      const booking = await this.bookingModel.create(
        {
          user_id: userId,
          parking_lot_id: lot.id,
          parking_slot_id: slot.id,
          vehicle_id: vehicle.id,
          duration_hours: dto.duration_hours,
          price_per_hour: lot.price_per_hour,
          total_cost: totalCost,
          payment_method: dto.payment_method,
          status: 'active',
          start_time: start,
          end_time: end,
        },
        { transaction },
      );

      if (dto.payment_method === 'wallet') {
        await this.walletService.debit(userId, totalCost, 'BOOKING_PAYMENT', booking.id, transaction);
      }

      await this.notificationsService.notify(
        userId,
        'BOOKING_CONFIRMED',
        { lot: lot.name, slot: slot.slot_number, hours: dto.duration_hours },
        transaction,
      );
      return booking.id;
    });

    return { message: this.t('BOOKING_CREATED'), booking: await this.findUserBooking(userId, bookingId) };
  }

  async getUserBookings(userId: number, query: BookingQueryDto): Promise<PaginationResult<Booking>> {
    await this.completeExpiredBookings(userId);

    return this.pagination.findAll(
      query.page,
      query.pageSize,
      {
        where: { user_id: userId, ...(query.status && { status: query.status }) },
        include: BOOKING_DETAILS,
        order: [['start_time', 'DESC']],
      },
      { status: query.status },
    );
  }

  /** One of the user's own bookings (another user's booking is a 404, not a leak). */
  async findUserBooking(userId: number, bookingId: number): Promise<Booking> {
    await this.completeExpiredBookings(userId);

    const booking = await this.bookingModel.findOne({
      where: { id: bookingId, user_id: userId },
      include: BOOKING_DETAILS,
    });
    if (!booking) {
      throw new NotFoundException(this.t('BOOKING_NOT_FOUND'));
    }
    return booking;
  }

  /**
   * The receipt for one of the user's bookings. It's built from the wallet's
   * records, not recalculated from the booking, so it always matches the
   * money that actually moved.
   */
  async getReceipt(userId: number, bookingId: number): Promise<BookingReceipt> {
    return this.buildReceipt(await this.findUserBooking(userId, bookingId));
  }

  private async buildReceipt(booking: Booking): Promise<BookingReceipt> {
    const charges = await this.walletService.bookingCharges(booking.id);
    // Older demo bookings marked "card" have no wallet records: their price is what was booked.
    const subtotal = booking.payment_method === 'wallet' ? charges.charged : booking.total_cost;

    return {
      receipt_number: receiptNumber(booking.id),
      issued_at: charges.firstChargedAt ?? (booking.createdAt as Date),
      payment_method: booking.payment_method,
      subtotal,
      refunded: charges.refunded,
      total: subtotal - charges.refunded,
      booking,
    };
  }

  /** Adds hours at the price the booking was made with. */
  async extendBooking(
    userId: number,
    bookingId: number,
    dto: ExtendBookingDto,
  ): Promise<{ message: string; booking: Booking }> {
    await this.completeExpiredBookings(userId);

    await this.sequelize.transaction(async (transaction) => {
      await this.usersService.lockForUpdate(userId, transaction);
      const booking = await this.getActiveBooking(userId, bookingId, transaction);

      const totalHours = booking.duration_hours + dto.extra_hours;
      if (totalHours > MAX_BOOKING_HOURS) {
        throw new BadRequestException(this.t('BOOKING_TOO_LONG', { max: MAX_BOOKING_HOURS }));
      }

      const lot = await this.parkingService.getLot(booking.parking_lot_id, transaction);
      const newEnd = new Date(booking.end_time.getTime() + dto.extra_hours * HOUR_MS);
      if (!isOpenDuring(lot, booking.end_time, newEnd)) {
        throw new BadRequestException(
          this.t('PARKING_CLOSED_DURING_BOOKING', { opening: lot.opening_time, closing: lot.closing_time }),
        );
      }

      const extraCost = booking.price_per_hour * dto.extra_hours;
      if (dto.payment_method === 'wallet') {
        await this.walletService.debit(userId, extraCost, 'BOOKING_EXTENSION', booking.id, transaction);
      }

      await booking.update(
        {
          end_time: newEnd,
          duration_hours: totalHours,
          total_cost: booking.total_cost + extraCost,
        },
        { transaction },
      );

      await this.notificationsService.notify(
        userId,
        'BOOKING_EXTENDED',
        { lot: lot.name, hours: dto.extra_hours },
        transaction,
      );
    });

    return { message: this.t('BOOKING_EXTENDED'), booking: await this.findUserBooking(userId, bookingId) };
  }

  /**
   * Cancels a booking and frees its slot. Refund rule: everything back within the
   * first FREE_CANCELLATION_MINUTES, after that only the unused whole hours.
   * Only money that came from the wallet goes back to the wallet.
   */
  async cancelBooking(userId: number, bookingId: number): Promise<{ message: string; refund: number }> {
    await this.completeExpiredBookings(userId);

    const refund = await this.sequelize.transaction(async (transaction) => {
      await this.usersService.lockForUpdate(userId, transaction);
      const booking = await this.getActiveBooking(userId, bookingId, transaction);

      await booking.update({ status: 'cancelled' }, { transaction });
      await this.parkingService.releaseSlot(booking.parking_slot_id, transaction);

      const paidFromWallet = await this.walletService.netPaidForBooking(booking.id, transaction);
      const refund = Math.min(this.refundableAmount(booking, new Date()), paidFromWallet);
      if (refund > 0) {
        await this.walletService.credit(userId, refund, 'BOOKING_REFUND', booking.id, transaction);
      }

      const lot = await this.parkingService.getLot(booking.parking_lot_id, transaction);
      await this.notificationsService.notify(
        userId,
        'BOOKING_CANCELLED',
        { lot: lot.name, refund: formatDinars(refund) },
        transaction,
      );
      return refund;
    });

    return {
      message: refund > 0 ? this.t('BOOKING_CANCELLED_REFUNDED', { amount: formatDinars(refund) }) : this.t('BOOKING_CANCELLED'),
      refund,
    };
  }

  // ---------------------------------------------------------------- helpers

  private async getActiveBooking(userId: number, bookingId: number, transaction: Transaction): Promise<Booking> {
    const booking = await this.bookingModel.findOne({
      where: { id: bookingId, user_id: userId },
      transaction,
    });
    if (!booking) {
      throw new NotFoundException(this.t('BOOKING_NOT_FOUND'));
    }
    if (booking.status !== 'active') {
      throw new ConflictException(this.t('BOOKING_NOT_ACTIVE'));
    }
    return booking;
  }

  private refundableAmount(booking: Booking, now: Date): number {
    const minutesSinceStart = (now.getTime() - booking.start_time.getTime()) / 60_000;
    if (minutesSinceStart <= FREE_CANCELLATION_MINUTES) {
      return booking.total_cost;
    }
    const unusedHours = Math.max(0, Math.floor((booking.end_time.getTime() - now.getTime()) / HOUR_MS));
    return unusedHours * booking.price_per_hour;
  }
}
