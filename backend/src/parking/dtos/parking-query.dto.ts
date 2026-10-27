import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Trim, UpperCaseTrim } from 'src/common/transformers/normalize';
import { LEVEL_PATTERN } from './create-parking-slot.dto';

/** Largest search radius, in kilometres. */
export const MAX_RADIUS_KM = 50;

/** GET /parking/nearby?lat=35.56&lng=45.43&radius=5 */
export class NearbyQueryDto extends PaginationQueryDto {
  @ApiProperty({ example: 35.5571 })
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(-90, { message: i18nValidationMessage('validation.MIN') })
  @Max(90, { message: i18nValidationMessage('validation.MAX') })
  lat!: number;

  @ApiProperty({ example: 45.4356 })
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(-180, { message: i18nValidationMessage('validation.MIN') })
  @Max(180, { message: i18nValidationMessage('validation.MAX') })
  lng!: number;

  @ApiPropertyOptional({
    description: 'Kilometres.',
    default: 5,
    maximum: MAX_RADIUS_KM,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(0.1, { message: i18nValidationMessage('validation.MIN') })
  @Max(MAX_RADIUS_KM, { message: i18nValidationMessage('validation.MAX') })
  radius: number = 5;
}

/** GET /parking/search?q=city */
export class SearchQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Part of the name or the address.',
    example: 'City',
  })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(1, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  q!: string;
}

/** GET /parking/:id/slots?level=B1 */
export class SlotsQueryDto {
  @ApiPropertyOptional({ example: 'B1' })
  @IsOptional()
  @UpperCaseTrim()
  @Matches(LEVEL_PATTERN, {
    message: i18nValidationMessage('validation.LEVEL_PATTERN'),
  })
  level?: string;
}
