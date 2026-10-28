import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import {
  BOOKING_SOURCES,
  BOOKING_STATUSES,
  type BookingSource,
  type BookingStatus,
} from 'src/booking/entities/booking.entity';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Trim } from 'src/common/transformers/normalize';

/** Which bookings by when they started, in Iraq days: today, the last 7 or 30 days, or all. */
export const BOOKING_PERIODS = ['today', '7d', '30d', 'all'] as const;
export type BookingPeriod = (typeof BOOKING_PERIODS)[number];

/** GET /garage/garages/:id/bookings?q=&status=&source=&period=&page=&pageSize= */
export class GarageBookingsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      "The customer's name, a plate (spaces don't matter) or a booking number like #1042.",
    example: '22 SUL',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  q?: string;

  @ApiPropertyOptional({ enum: BOOKING_STATUSES })
  @IsOptional()
  @IsIn(BOOKING_STATUSES, {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  status?: BookingStatus;

  @ApiPropertyOptional({ enum: BOOKING_SOURCES })
  @IsOptional()
  @IsIn(BOOKING_SOURCES, { message: i18nValidationMessage('validation.IS_IN') })
  source?: BookingSource;

  @ApiPropertyOptional({ enum: BOOKING_PERIODS, default: 'all' })
  @IsOptional()
  @IsIn(BOOKING_PERIODS, { message: i18nValidationMessage('validation.IS_IN') })
  period?: BookingPeriod;
}
