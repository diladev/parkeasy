import { Injectable } from '@nestjs/common';
import { col, fn, Op, where as whereFn, type WhereOptions } from 'sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import { addDays, iraqDayStart } from 'src/common/iraq-time';
import { escapeLike } from 'src/common/like';
import type { PaginationResult } from 'src/common/pagination/interfaces/pagination-result.interface';
import { ModelPagination } from 'src/common/pagination/model-pagination';
import {
  bookingRowIncludes,
  toBookingRow,
  type GarageBookingRow,
} from 'src/parking/garage-stats.service';
import type {
  BookingPeriod,
  GarageBookingsQueryDto,
} from './dtos/garage-bookings-query.dto';
import { GaragePortalService } from './garage-portal.service';

/** The Bookings page: one owned garage's app bookings and walk-ins, newest first. */
@Injectable()
export class GarageBookingsService {
  constructor(private readonly portal: GaragePortalService) {}

  async list(
    ownerId: number,
    lotId: number,
    query: GarageBookingsQueryDto,
    now = new Date(),
  ): Promise<PaginationResult<GarageBookingRow>> {
    const lot = await this.portal.ownedLot(ownerId, lotId);
    const q = query.q || undefined;
    const period = query.period ?? 'all';

    const conditions: WhereOptions<Booking>[] = [{ parking_lot_id: lot.id }];
    if (query.status) conditions.push({ status: query.status });
    if (query.source) conditions.push({ source: query.source });
    const from = periodStart(period, now);
    if (from) conditions.push({ start_time: { [Op.gte]: from } });
    if (q) conditions.push(searchWhere(q));

    const pagination = new ModelPagination(
      Booking,
      `/garage/garages/${lot.id}/bookings`,
    );
    const page = await pagination.findAll(
      query.page,
      query.pageSize,
      {
        where: { [Op.and]: conditions },
        include: bookingRowIncludes(),
        order: [
          ['start_time', 'DESC'],
          ['id', 'DESC'],
        ],
        // The joins must sit next to the WHERE that searches the name and plate.
        subQuery: false,
      },
      {
        q,
        status: query.status,
        source: query.source,
        period: query.period,
      },
    );
    return { ...page, data: page.data.map(toBookingRow) };
  }
}

/** Where `period` starts: midnight Iraq time today, 6 or 29 days before, or no limit. */
export function periodStart(period: BookingPeriod, now: Date): Date | null {
  const today = iraqDayStart(now);
  switch (period) {
    case 'today':
      return today;
    case '7d':
      return addDays(today, -6);
    case '30d':
      return addDays(today, -29);
    case 'all':
      return null;
  }
}

/**
 * The customer's name, the app booking's vehicle plate or the walk-in's
 * plate, or the booking number ("1042" or "#1042"). Plates are compared
 * without spaces, so "22SUL" finds "22 SUL 48213".
 */
function searchWhere(q: string): WhereOptions<Booking> {
  const pattern = `%${escapeLike(q)}%`;
  const compact = `%${escapeLike(q.replace(/\s+/g, ''))}%`;
  const withoutSpaces = (column: string) => fn('REPLACE', col(column), ' ', '');

  const conditions: WhereOptions<Booking>[] = [
    { '$user.name$': { [Op.like]: pattern } },
    whereFn(withoutSpaces('vehicle.license_plate'), { [Op.like]: compact }),
    whereFn(withoutSpaces('Booking.plate'), { [Op.like]: compact }),
  ];
  const number = /^#?(\d{1,9})$/.exec(q);
  if (number) conditions.push({ id: Number(number[1]) });
  return { [Op.or]: conditions };
}
