import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize'
import { ParkingSlot } from './entities/parking-slot.entity';
import { TranslationService } from 'src/i18n/translation.service';
import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { CreateParkingLotDto, CreateParkingSlotDto, CreateParkingSlotsDto, UpdateParkingLotDto } from './dtos';

@Injectable()
export class ParkingService {
  private readonly logger = new Logger(ParkingService.name);
  private readonly pagination: ModelPagination<ParkingLot>;

  constructor(
    @InjectModel(ParkingLot) private parkingLotModel: typeof ParkingLot,
    @InjectModel(ParkingSlot) private parkingSlotModel: typeof ParkingSlot,
    private readonly translationService: TranslationService
  ) {
    this.pagination = new ModelPagination<ParkingLot>(ParkingLot);
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm = 5,
    page = 1,
    pageSize = 10
  ): Promise<PaginationResult<ParkingLot>> {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const options = {
      where: {
        latitude: { [Op.between]: [lat - latDelta, lat + latDelta] },
        longitude: { [Op.between]: [lng - lngDelta, lng + lngDelta] }
      },
      include: [{ model: ParkingSlot, where: { status: 'free' }, required: false }]
    };

    return this.pagination.findAll(page, pageSize, options)
  }

  async search(
    query: string,
    page = 1,
    pageSize = 10
  ): Promise<PaginationResult<ParkingLot>> {
    const options = {
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${query}%` } },
          { address: { [Op.like]: `%${query}%` } }
        ]
      }
    };

    return this.pagination.findAll(page, pageSize, options);
  }

  async findById(id: number, lang: string): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findOne({
      where: { id },
      include: [ParkingSlot]
    });

    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate('message.PARKING_NOT_FOUND', { lang: lang })
      )
    }

    return lot;
  }

  async getSlots(parkingLotId: number, level?: string): Promise<ParkingSlot[]> {
    const where: WhereOptions = { parkingLotId };
    if (level) where['level'] = level;
    return this.parkingSlotModel.findAll({ where });
  }

  async findSlotById(slotId: number, lang: string): Promise<ParkingSlot> {
    const slot = await this.parkingSlotModel.findOne({ where: { id: slotId } });

    if (!slot) {
      throw new NotFoundException(
        this.translationService.translate('message.PARKING_SLOT_NOT_FOUND', { lang: lang })
      )
    }

    return slot;
  }

  async updateSlotStatus(slotId: number, status: 'free' | 'occupied' | 'reserved', lang: string):
    Promise<ParkingSlot> {
    const slot = await this.findSlotById(slotId, lang);
    await slot.update({ status });
    return slot;
  }

  async findAll(page = 1, pageSize = 10): Promise<PaginationResult<ParkingLot>> {
    return this.pagination.findAll(page, pageSize);
  }

  async createLot(dto: CreateParkingLotDto): Promise<ParkingLot> {
    return this.parkingLotModel.create({
      ...dto,
      is_available: true,
      rating: 0,
    });
  }

  async updateLot(
    id: number,
    dto: UpdateParkingLotDto,
    lang: string,
  ): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findOne({
      where: { id },
    });

    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate(
          'message.PARKING_NOT_FOUND',
          { lang },
        ),
      );
    }

    await lot.update(dto);

    return lot;
  }

  async addSlot(
    parkingLotId: number,
    dto: CreateParkingSlotDto,
    lang: string,
  ): Promise<ParkingSlot> {
    const lot = await this.parkingLotModel.findOne({
      where: {
        id: parkingLotId,
        is_available: true,
      },
    });

    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate(
          'message.PARKING_NOT_FOUND',
          { lang },
        ),
      );
    }

    const existingSlot = await this.parkingSlotModel.findOne({
      where: {
        parking_lot_id: parkingLotId,
        slot_number: dto.slot_number,
      },
    });

    if (existingSlot) {
      throw new ConflictException(
        this.translationService.translate(
          'message.PARKING_SLOT_DUPLICATE',
          { lang },
        ),
      );
    }

    return this.parkingSlotModel.create({
      ...dto,
      parking_lot_id: parkingLotId,
      status: 'free',
    });
  }

  async createSlots(
    parkingLotId: number,
    dto: CreateParkingSlotsDto,
    lang: string,
  ): Promise<ParkingSlot[]> {
    const lot = await this.parkingLotModel.findOne({
      where: {
        id: parkingLotId,
        is_available: true,
      },
    });

    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate(
          'message.PARKING_NOT_FOUND',
          { lang },
        ),
      );
    }

    const slotNumbers = dto.slots.map(
      (slot) => slot.slot_number,
    );

    const uniqueSlotNumbers = new Set(slotNumbers);

    if (uniqueSlotNumbers.size !== slotNumbers.length) {
      throw new ConflictException(
        this.translationService.translate(
          'message.PARKING_SLOT_DUPLICATE',
          { lang },
        ),
      );
    }

    const existingSlots = await this.parkingSlotModel.findAll({
      where: {
        parking_lot_id: parkingLotId,
        slot_number: {
          [Op.in]: slotNumbers,
        },
      },
    });

    if (existingSlots.length > 0) {
      throw new ConflictException(
        this.translationService.translate(
          'message.PARKING_SLOT_DUPLICATE',
          { lang },
        ),
      );
    }

    return this.parkingSlotModel.bulkCreate(
      dto.slots.map((slot) => ({
        ...slot,
        parking_lot_id: parkingLotId,
        status: 'free',
      })),
    );
  }

  async deleteLot(
    id: number,
    lang: string,
  ): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findOne({
      where: { id },
      include: [
        {
          model: ParkingSlot,
          required: false,
        },
      ],
    });

    if (!lot) {
      throw new NotFoundException(
        this.translationService.translate(
          'message.PARKING_NOT_FOUND',
          { lang },
        ),
      );
    }

    const hasReservedSlots = lot.slots?.some(
      (slot) => slot.status === 'reserved',
    );

    if (hasReservedSlots) {
      // TODO: When the notification module is implemented,
      // notify users who have reservations for this parking lot.
    }

    await lot.update({
      is_available: false,
    });

    await this.parkingSlotModel.update(
      { status: 'unavailable' },
      {
        where: {
          parking_lot_id: id,
        },
      },
    );

    return lot;
  }

  async deleteSlot(
    slotId: number,
    lang: string,
  ): Promise<ParkingSlot> {
    const slot = await this.parkingSlotModel.findOne({
      where: {
        id: slotId,
      },
    });

    if (!slot) {
      throw new NotFoundException(
        this.translationService.translate(
          'message.PARKING_SLOT_NOT_FOUND',
          { lang },
        ),
      );
    }

    if (slot.status === 'reserved') {
      // TODO: When the notification module is implemented,
      // notify the user that their reserved parking slot is no longer available.
    }

    await slot.update({
      status: 'unavailable',
    });

    return slot;
  }
}
