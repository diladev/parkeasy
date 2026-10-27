import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { BOOKING_STATUSES } from '../entities/booking.entity';

/** GET /booking?status=active&page=1 */
export class BookingQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: BOOKING_STATUSES,
    description: 'Leave empty for all bookings.',
  })
  @IsOptional()
  @IsIn(BOOKING_STATUSES, {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  status?: string;
}
