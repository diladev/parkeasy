import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import { iraqDateKey } from 'src/common/iraq-time';
import { TranslationService } from 'src/i18n/translation.service';
import type { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { PriceOverride } from 'src/parking/entities/price-override.entity';
import type { GarageStatus } from 'src/parking/garage-status';
import { ParkingService } from 'src/parking/parking.service';
import { checkPrices } from 'src/parking/price-settings';
import type { LotSettingsDto } from './dtos/lot-settings.dto';
import { GaragePortalService } from './garage-portal.service';

/** GET /garage/garages/:id/settings: what the Lot Settings page edits. */
export interface LotSettings {
  id: number;
  status: GarageStatus;
  name: string;
  address: string;
  city: string;
  is_open_24h: boolean;
  opening_time: string;
  closing_time: string;
  price_per_hour: number;
  daily_cap: number | null;
  free_cancellation_minutes: number;
  has_cctv: boolean;
  has_ev_charging: boolean;
  is_covered: boolean;
  is_accessible: boolean;
  /** Slots the lot has, blocked ones included (managed on the Live Slots page). */
  total_slots: number;
  /** Special prices that haven't ended, soonest first. */
  price_overrides: {
    id: number;
    label: string;
    start_date: string;
    end_date: string;
    price_per_hour: number;
    daily_cap: number | null;
  }[];
  /** The Iraq calendar day on the server, so the page checks dates against the same "today". */
  today: string;
}

/**
 * The Lot Settings page: details, prices (hourly, daily cap, special days),
 * opening hours and amenities of one owned garage. New prices apply to new
 * bookings and walk-ins; ones already running keep the prices they started with.
 */
@Injectable()
export class GarageSettingsService {
  private readonly logger = new Logger(GarageSettingsService.name);

  constructor(
    @InjectModel(ParkingSlot) private readonly slotModel: typeof ParkingSlot,
    @InjectModel(PriceOverride)
    private readonly overrideModel: typeof PriceOverride,
    @InjectConnection() private readonly sequelize: Sequelize,
    private readonly portal: GaragePortalService,
    private readonly parking: ParkingService,
    private readonly translationService: TranslationService,
  ) {}

  async settings(
    ownerId: number,
    lotId: number,
    now = new Date(),
  ): Promise<LotSettings> {
    return this.present(await this.portal.ownedLot(ownerId, lotId), now);
  }

  async save(
    ownerId: number,
    lotId: number,
    dto: LotSettingsDto,
    now = new Date(),
  ): Promise<{ message: string; settings: LotSettings }> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const today = iraqDateKey(now);

    const problem = checkPrices(dto, today);
    if (problem) {
      throw new BadRequestException(
        this.translationService.translate(`message.${problem.key}`, {
          args: problem.args,
        }),
      );
    }

    const { price_overrides: overrides, ...fields } = dto;
    await this.sequelize.transaction(async (transaction) => {
      await lot.update(
        {
          ...fields,
          daily_cap: fields.daily_cap ?? null,
          free_cancellation_minutes:
            fields.free_cancellation_minutes ?? lot.free_cancellation_minutes,
        },
        { transaction },
      );
      // The list replaces every special price that hasn't ended; past ones stay as history.
      await this.overrideModel.destroy({
        where: { parking_lot_id: lot.id, end_date: { [Op.gte]: today } },
        transaction,
      });
      await this.overrideModel.bulkCreate(
        overrides.map((rule) => ({
          parking_lot_id: lot.id,
          label: rule.label,
          start_date: rule.start_date,
          end_date: rule.end_date,
          price_per_hour: rule.price_per_hour,
          daily_cap: rule.daily_cap ?? null,
        })),
        { transaction },
      );
    });

    this.logger.log(
      `Owner ${ownerId}: saved the settings of garage ${lot.id} (${overrides.length} special prices)`,
    );
    return {
      message: this.translationService.translate(
        'message.GARAGE_SETTINGS_SAVED',
      ),
      settings: await this.present(lot, now),
    };
  }

  private async present(lot: ParkingLot, now: Date): Promise<LotSettings> {
    const [totalSlots, overrides] = await Promise.all([
      this.slotModel.count({
        where: { parking_lot_id: lot.id, status: { [Op.ne]: 'unavailable' } },
      }),
      this.parking.upcomingOverrides(lot.id, now),
    ]);
    return {
      id: lot.id,
      status: lot.status,
      name: lot.name,
      address: lot.address,
      city: lot.city,
      is_open_24h: lot.is_open_24h,
      opening_time: lot.opening_time,
      closing_time: lot.closing_time,
      price_per_hour: lot.price_per_hour,
      daily_cap: lot.daily_cap,
      free_cancellation_minutes: lot.free_cancellation_minutes,
      has_cctv: lot.has_cctv,
      has_ev_charging: lot.has_ev_charging,
      is_covered: lot.is_covered,
      is_accessible: lot.is_accessible,
      total_slots: totalSlots,
      price_overrides: overrides.map((rule) => ({
        id: rule.id,
        label: rule.label,
        start_date: rule.start_date,
        end_date: rule.end_date,
        price_per_hour: rule.price_per_hour,
        daily_cap: rule.daily_cap,
      })),
      today: iraqDateKey(now),
    };
  }
}
