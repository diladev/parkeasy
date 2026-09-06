import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateBookingDto, ExtendBookingDto } from './dto'
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { Booking } from './entities/booking.entity';
import { InjectModel } from '@nestjs/sequelize';
import { ParkingService } from 'src/parking/parking.service';
import { WalletService } from 'src/wallet/wallet.service';
import { TranslationService } from 'src/i18n/translation.service';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private readonly pagination: ModelPagination<Booking>;

  constructor(
    @InjectModel(Booking) private bookingModel: typeof Booking,
    private readonly parkingService: ParkingService,
    private readonly walletService: WalletService,
    private readonly translationService: TranslationService
  ) {
    this.pagination = new ModelPagination<Booking>(Booking);
  }

  async createBooking(userId: number, dto: CreateBookingDto, lang: string) {
    const activeBooking = await this.bookingModel.findOne({
      where: { user_id: userId, status: 'active' }
    });
    if (activeBooking) {
      throw new BadRequestException(
        this.translationService.translate('message.BOOKING_ALREADY_ACTIVE', { lang: lang })
      )
    }
    const slot = await this.parkingService.findSlotById(dto.parking_slot_id, lang)
    if (slot.status !== 'free') {
      throw new BadRequestException(
        this.translationService.translate('message.PARKING_SLOT_UNAVAILABLE', { lang: lang })
      )
    }

    const lot = await this.parkingService.findById(dto.parking_lot_id, lang);
    const totalCost = lot.price_per_hour * dto.duration_hours;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + dto.duration_hours * 60 * 60 * 1000);

    if (dto.payment_method === 'wallet') {
      await this.walletService.deduct(userId, totalCost, lang);
    }

    await this.parkingService.updateSlotStatus(dto.parking_slot_id, 'reserved', lang);

    const booking = await this.bookingModel.create({
      user_id: userId,
      parking_lot_id: dto.parking_lot_id,
      parking_slot_id: dto.parking_slot_id,
      vehicle_id: dto.vehicle_id,
      duration_hours: dto.duration_hours,
      total_cost: totalCost,
      payment_method: dto.payment_method,
      status: 'active',
      start_time: startTime,
      end_time: endTime
    });

    return booking;
  }

  async getUserBookings(
    userId: number,
    status?: string,
    page = 1,
    pageSize = 10,
  ): Promise<PaginationResult<Booking>> {
    const where: any = { user_id: userId };
    if (status) where.status = status;

    return this.pagination.findAll(page, pageSize, {
      where,
      include: [
        { model: ParkingLot },
        { model: ParkingSlot },
        { model: Vehicle },
      ],
    } as any);
  }

  async findById(id: number, lang: string): Promise<Booking> {
    const booking = await this.bookingModel.findOne({
      where: { id },
      include: [
        { model: ParkingLot },
        { model: ParkingSlot },
        { model: Vehicle },
      ],
    });
    if (!booking) {
      throw new NotFoundException(
        this.translationService.translate('message.BOOKING_NOT_FOUND', { lang: lang }),
      );
    }
    return booking;
  }

  async extendBooking(userId: number, bookingId: number, dto: ExtendBookingDto, lang: string) {
    const booking = await this.bookingModel.findOne({
      where: { id: bookingId, user_id: userId, status: 'active' },
    });
    if (!booking) {
      throw new NotFoundException(
        this.translationService.translate('message.BOOKING_NOT_ACTIVE', { lang: lang }),
      );
    }

    const lot = await this.parkingService.findById(booking.parking_lot_id, lang);
    const extraCost = lot.price_per_hour * dto.extra_hours;
    const newEndTime = new Date(
      booking.end_time.getTime() + dto.extra_hours * 60 * 60 * 1000,
    );

    if (dto.payment_method === 'wallet') {
      await this.walletService.deduct(userId, extraCost, lang);
    }

    const extendedBooking = await booking.update({
      end_time: newEndTime,
      duration_hours: booking.duration_hours + dto.extra_hours,
      total_cost: booking.total_cost + extraCost,
    });

    return extendedBooking;
  }

  async cancelBooking(userId: number, bookingId: number, lang: string) {
    const booking = await this.bookingModel.findOne({
      where: { id: bookingId, user_id: userId, status: 'active' },
    });
    if (!booking) {
      throw new NotFoundException(
        this.translationService.translate('message.BOOKING_NOT_ACTIVE', { lang: lang }),
      );
    }

    await this.parkingService.updateSlotStatus(booking.parking_slot_id, 'free', lang);

    if (booking.payment_method === 'wallet') {
      await this.walletService.credit(userId, booking.total_cost);
    }

    await booking.update({ status: 'cancelled' });

    return {
      message: this.translationService.translate('message.BOOKING_CANCELLED', { lang: lang }),
    };
  }

  async completeBooking(bookingId: number, lang: string) {
    const booking = await this.findById(bookingId, lang);
    if (booking.status !== 'active') return;

    await this.parkingService.updateSlotStatus(booking.parking_slot_id, 'free', lang);
    await booking.update({ status: 'completed' });
  }
}
