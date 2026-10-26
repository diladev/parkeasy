import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Trim } from 'src/common/transformers/normalize';
import { GARAGE_STATUSES, type GarageStatus } from '../garage-status';

/** GET /admin/garages?status=pending&q=erbil&page=1&pageSize=10 */
export class AdminGaragesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: GARAGE_STATUSES })
  @IsOptional()
  @IsIn(GARAGE_STATUSES, { message: i18nValidationMessage('validation.IS_IN') })
  status?: GarageStatus;

  @ApiPropertyOptional({
    description: "Part of the name, city, address or owner's name.",
    example: 'Erbil',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  q?: string;
}
