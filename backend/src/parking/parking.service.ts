import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { col, fn, Op, Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import { ArrayPagination } from 'src/common/pagination/pagination';
import { TranslationService } from 'src/i18n/translation.service';
import { ParkingLot } from './entities/parking-lot.entity';
import { FavoriteLot } from './entities/favorite-lot.entity';
import { OUT_OF_SERVICE, ParkingSlot } from './entities/parking-slot.entity';
import { boundingBox, distanceKm } from './geo';
import {
  CreateParkingLotDto,
  CreateParkingSlotDto,
  CreateParkingSlotsDto,
  NearbyQueryDto,
  SearchQueryDto,
  SlotsQueryDto,
  UpdateParkingLotDto,
} from './dtos';

/** A lot as the app lists it: its columns plus live slot counts (and the distance, for nearby). */
export type ParkingLotView = Record<string, unknown> & {
  total_slots: number;
  available_slots: number;
  distance_km?: number;
};

export interface SlotCounts {
  total: number;
  available: number;
}

/** Lots drivers can see and book: not removed, and approved by an admin. */
export const LISTED_LOT = { is_available: true, status: 'approved' } as const;

/** "B1:A01": a slot number is unique per level, not per lot. */
const slotKey = (slot: { level: string; slot_number: string }) =>
  `${slot.level}:${slot.slot_number}`;

@Injectable()
export class ParkingService {
  private readonly searchPagination = new ModelPagination(
    ParkingLot,
    '/parking/search',
  );

  constructor(
    @InjectModel(ParkingLot)
    private readonly parkingLotModel: typeof ParkingLot,
    @InjectModel(ParkingSlot)
    private readonly parkingSlotModel: typeof ParkingSlot,
    @InjectModel(FavoriteLot)
    private readonly favoriteModel: typeof FavoriteLot,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly translationService: TranslationService,
  ) {}

  private t(key: string, args?: Record<string, unknown>): string {
    return this.translationService.translate(`message.${key}`, { args });
  }

  // ------------------------------------------------------- for the app

  /** Lots within `radius` km, closest first, each with its distance. */
  async findNearby(
    query: NearbyQueryDto,
  ): Promise<PaginationResult<ParkingLotView>> {
    const { lat, lng, radius } = query;
    const box = boundingBox(lat, lng, radius);

    const candidates = await this.parkingLotModel.findAll({
      where: {
        ...LISTED_LOT,
        latitude: { [Op.between]: [box.minLat, box.maxLat] },
        longitude: { [Op.between]: [box.minLng, box.maxLng] },
      },
    });

    // The box has corners outside the circle: keep only lots really within the radius.
    const nearby = candidates
      .map((lot) => ({
        lot,
        distance: distanceKm(lat, lng, lot.latitude, lot.longitude),
      }))
      .filter(({ distance }) => distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    const page = new ArrayPagination<(typeof nearby)[number]>(
      '/parking/nearby',
    ).paginate(nearby, query.page, query.pageSize, { lat, lng, radius });
    const counts = await this.countSlots(page.data.map(({ lot }) => lot.id));

    return {
      ...page,
      data: page.data.map(({ lot, distance }) =>
        this.present(lot, counts, distance),
      ),
    };
  }

  async search(
    query: SearchQueryDto,
  ): Promise<PaginationResult<ParkingLotView>> {
    const pattern = `%${query.q}%`;
    const page = await this.searchPagination.findAll(
      query.page,
      query.pageSize,
      {
        where: {
          ...LISTED_LOT,
          [Op.or]: [
            { name: { [Op.like]: pattern } },
            { address: { [Op.like]: pattern } },
          ],
        },
        order: [['name', 'ASC']],
      },
      { q: query.q },
    );
    const counts = await this.countSlots(page.data.map((lot) => lot.id));

    return { ...page, data: page.data.map((lot) => this.present(lot, counts)) };
  }

  /** One lot with its slots, for the lot details screen, and whether [userId] saved it. */
  async getLotDetails(
    id: number,
    userId: number,
  ): Promise<ParkingLotView & { slots: ParkingSlot[]; is_favorite: boolean }> {
    const lot = await this.getBookableLot(id);
    const [slots, counts, favorite] = await Promise.all([
      this.findSlots(id),
      this.countSlots([id]),
      this.favoriteModel.count({
        where: { user_id: userId, parking_lot_id: id },
      }),
    ]);
    return { ...this.present(lot, counts), slots, is_favorite: favorite > 0 };
  }

  // ------------------------------------------------------------- favorites

  /** The lots the user saved, last saved first. Removed and suspended lots drop out. */
  async getFavorites(userId: number): Promise<ParkingLotView[]> {
    const favorites = await this.favoriteModel.findAll({
      where: { user_id: userId },
      include: [{ model: ParkingLot, required: true, where: LISTED_LOT }],
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    const lots = favorites.map((favorite) => favorite.parking_lot);
    const counts = await this.countSlots(lots.map((lot) => lot.id));
    return lots.map((lot) => this.present(lot, counts));
  }

  /** Saving twice is fine: it stays saved once. */
  async addFavorite(
    userId: number,
    lotId: number,
  ): Promise<{ is_favorite: true }> {
    await this.getBookableLot(lotId);
    await this.favoriteModel.findOrCreate({
      where: { user_id: userId, parking_lot_id: lotId },
      defaults: { user_id: userId, parking_lot_id: lotId },
    });
    return { is_favorite: true };
  }

  /** Removing one that isn't saved is fine too. */
  async removeFavorite(
    userId: number,
    lotId: number,
  ): Promise<{ is_favorite: false }> {
    await this.favoriteModel.destroy({
      where: { user_id: userId, parking_lot_id: lotId },
    });
    return { is_favorite: false };
  }

  async getSlots(lotId: number, query: SlotsQueryDto): Promise<ParkingSlot[]> {
    await this.getBookableLot(lotId);
    return this.findSlots(lotId, query.level);
  }

  // ------------------------------------------------- used by BookingService

  /** A lot that can be booked (approved and not removed), or a 404. */
  async getBookableLot(
    id: number,
    transaction?: Transaction,
  ): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findOne({
      where: { id, ...LISTED_LOT },
      transaction,
    });
    if (!lot) {
      throw new NotFoundException(this.t('PARKING_NOT_FOUND'));
    }
    return lot;
  }

  /** A lot an admin can manage: any status, but not removed. */
  async getManagedLot(
    id: number,
    transaction?: Transaction,
  ): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findOne({
      where: { id, is_available: true },
      transaction,
    });
    if (!lot) {
      throw new NotFoundException(this.t('PARKING_NOT_FOUND'));
    }
    return lot;
  }

  /** Any lot, even a removed one (for bookings that already exist). */
  async getLot(id: number, transaction?: Transaction): Promise<ParkingLot> {
    const lot = await this.parkingLotModel.findByPk(id, {
      transaction,
      paranoid: false,
    });
    if (!lot) {
      throw new NotFoundException(this.t('PARKING_NOT_FOUND'));
    }
    return lot;
  }

  /**
   * Reserves a slot of this lot. The UPDATE only matches while the slot is still
   * free, so when two people book the same slot at the same moment exactly one
   * of them gets it.
   */
  async reserveSlot(
    lotId: number,
    slotId: number,
    transaction: Transaction,
  ): Promise<ParkingSlot> {
    const slot = await this.parkingSlotModel.findOne({
      where: { id: slotId, parking_lot_id: lotId },
      transaction,
    });
    if (!slot || slot.status === 'unavailable') {
      throw new NotFoundException(this.t('PARKING_SLOT_NOT_FOUND'));
    }

    const [reserved] = await this.parkingSlotModel.update(
      { status: 'reserved' },
      { where: { id: slotId, status: 'free' }, transaction },
    );
    if (reserved === 0) {
      throw new ConflictException(this.t('PARKING_SLOT_UNAVAILABLE'));
    }
    return slot;
  }

  /** Frees a slot when its booking ends or is cancelled. */
  async releaseSlot(slotId: number, transaction: Transaction): Promise<void> {
    await this.parkingSlotModel.update(
      { status: 'free' },
      {
        where: { id: slotId, status: { [Op.in]: ['reserved', 'occupied'] } },
        transaction,
      },
    );
  }

  // ------------------------------------------- management (admins, see controller)

  /** An admin adds it, so it is approved straight away. */
  createLot(dto: CreateParkingLotDto): Promise<ParkingLot> {
    return this.parkingLotModel.create({ ...dto, status: 'approved' });
  }

  async updateLot(id: number, dto: UpdateParkingLotDto): Promise<ParkingLot> {
    const lot = await this.getManagedLot(id);
    return lot.update(dto);
  }

  /** Removes a lot from the app. Refused while any of its slots has an active booking. */
  async deleteLot(id: number): Promise<{ message: string }> {
    const lot = await this.getManagedLot(id);

    const slotsInUse = await this.parkingSlotModel.count({
      where: {
        parking_lot_id: id,
        status: { [Op.in]: ['reserved', 'occupied'] },
      },
    });
    if (slotsInUse > 0) {
      throw new ConflictException(this.t('PARKING_HAS_ACTIVE_BOOKINGS'));
    }

    await this.sequelize.transaction(async (transaction) => {
      await lot.update({ is_available: false }, { transaction });
      await this.parkingSlotModel.update(
        { status: 'unavailable' },
        { where: { parking_lot_id: id }, transaction },
      );
    });
    return { message: this.t('PARKING_DELETED') };
  }

  async addSlot(
    lotId: number,
    dto: CreateParkingSlotDto,
  ): Promise<ParkingSlot> {
    const [slot] = await this.createSlots(lotId, { slots: [dto] });
    return slot;
  }

  /**
   * Adds slots to a lot. A slot that was removed earlier comes back (as free)
   * instead of being created twice, which the unique index wouldn't allow.
   */
  async createSlots(
    lotId: number,
    dto: CreateParkingSlotsDto,
  ): Promise<ParkingSlot[]> {
    await this.getManagedLot(lotId);

    const keys = dto.slots.map(slotKey);
    if (new Set(keys).size !== keys.length) {
      throw new ConflictException(this.t('PARKING_SLOT_DUPLICATE'));
    }

    const slotFilter = dto.slots.map(({ level, slot_number }) => ({
      level,
      slot_number,
    }));
    const existing = await this.parkingSlotModel.findAll({
      where: { parking_lot_id: lotId, [Op.or]: slotFilter },
    });
    const removed = existing.filter((slot) => slot.status === 'unavailable');
    if (removed.length !== existing.length) {
      throw new ConflictException(this.t('PARKING_SLOT_DUPLICATE'));
    }

    return this.sequelize.transaction(async (transaction) => {
      if (removed.length > 0) {
        await this.parkingSlotModel.update(
          { status: 'free' },
          { where: { id: removed.map((slot) => slot.id) }, transaction },
        );
      }

      const removedKeys = new Set(removed.map(slotKey));
      const newSlots = dto.slots
        .filter((slot) => !removedKeys.has(slotKey(slot)))
        .map(({ level, slot_number }) => ({
          level,
          slot_number,
          parking_lot_id: lotId,
          status: 'free',
        }));
      await this.parkingSlotModel.bulkCreate(newSlots, { transaction });

      return this.parkingSlotModel.findAll({
        where: { parking_lot_id: lotId, [Op.or]: slotFilter },
        order: [
          ['level', 'ASC'],
          ['slot_number', 'ASC'],
        ],
        transaction,
      });
    });
  }

  /** Removes a slot. Refused while it has an active booking. */
  async deleteSlot(slotId: number): Promise<{ message: string }> {
    const slot = await this.parkingSlotModel.findByPk(slotId);
    if (!slot || slot.status === 'unavailable') {
      throw new NotFoundException(this.t('PARKING_SLOT_NOT_FOUND'));
    }

    // Only a free (or blocked) slot can be removed; checked in the UPDATE itself
    // so a booking made at the same moment can't slip in between.
    const [removed] = await this.parkingSlotModel.update(
      { status: 'unavailable' },
      { where: { id: slotId, status: { [Op.in]: ['free', 'blocked'] } } },
    );
    if (removed === 0) {
      throw new ConflictException(this.t('PARKING_SLOT_IN_USE'));
    }
    return { message: this.t('PARKING_SLOT_DELETED') };
  }

  // ---------------------------------------------------------------- helpers

  private findSlots(lotId: number, level?: string): Promise<ParkingSlot[]> {
    return this.parkingSlotModel.findAll({
      where: {
        parking_lot_id: lotId,
        status: { [Op.ne]: 'unavailable' },
        ...(level && { level }),
      },
      order: [
        ['level', 'ASC'],
        ['slot_number', 'ASC'],
      ],
    });
  }

  /** Total and free slots per lot, in one grouped query. */
  async countSlots(lotIds: number[]): Promise<Map<number, SlotCounts>> {
    const counts = new Map<number, SlotCounts>();
    if (lotIds.length === 0) return counts;

    const rows = (await this.parkingSlotModel.findAll({
      attributes: [
        'parking_lot_id',
        'status',
        [fn('COUNT', col('id')), 'count'],
      ],
      // Blocked slots can't be booked for now: left out of "x of y free".
      where: {
        parking_lot_id: lotIds,
        status: { [Op.notIn]: OUT_OF_SERVICE },
      },
      group: ['parking_lot_id', 'status'],
      raw: true,
    })) as unknown as {
      parking_lot_id: number;
      status: string;
      count: number | string;
    }[];

    for (const row of rows) {
      const entry = counts.get(row.parking_lot_id) ?? {
        total: 0,
        available: 0,
      };
      entry.total += Number(row.count);
      if (row.status === 'free') entry.available += Number(row.count);
      counts.set(row.parking_lot_id, entry);
    }
    return counts;
  }

  private present(
    lot: ParkingLot,
    counts: Map<number, SlotCounts>,
    distance?: number,
  ): ParkingLotView {
    const { total, available } = counts.get(lot.id) ?? {
      total: 0,
      available: 0,
    };
    // Which account owns the lot is for the Admin Panel, not for drivers.
    const { owner_id: _ownerId, ...columns } =
      lot.toJSON<Record<string, unknown>>();
    return {
      ...columns,
      total_slots: total,
      available_slots: available,
      ...(distance !== undefined && {
        distance_km: Math.round(distance * 100) / 100,
      }),
    };
  }
}
