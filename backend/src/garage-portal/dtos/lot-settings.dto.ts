import { ApiProperty, ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { Trim } from 'src/common/transformers/normalize';
import { CreateParkingLotDto } from 'src/parking/dtos/create-parking-lot.dto';
import { MAX_OVERRIDE_DAYS } from 'src/parking/price-settings';

/** Special prices an owner can have coming up at once. */
export const MAX_PRICE_OVERRIDES = 20;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** A different price for some days (Eid, Newroz, a match day). */
export class PriceOverrideDto {
  @ApiProperty({ description: 'What it is for.', example: 'Eid al-Adha' })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(60, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  label!: string;

  @ApiProperty({
    description: 'First day (Iraq calendar day).',
    example: '2027-03-20',
  })
  @Matches(DATE_ONLY, {
    message: i18nValidationMessage('validation.DATE_PATTERN'),
  })
  @IsISO8601(
    { strict: true },
    { message: i18nValidationMessage('validation.DATE_PATTERN') },
  )
  start_date!: string;

  @ApiProperty({
    description: `Last day, included. At most ${MAX_OVERRIDE_DAYS} days after the first, and not before today.`,
    example: '2027-03-22',
  })
  @Matches(DATE_ONLY, {
    message: i18nValidationMessage('validation.DATE_PATTERN'),
  })
  @IsISO8601(
    { strict: true },
    { message: i18nValidationMessage('validation.DATE_PATTERN') },
  )
  end_date!: string;

  @ApiProperty({
    description: 'Price per hour on these days, in whole Iraqi dinars.',
    example: 2500,
  })
  @IsInt({ message: i18nValidationMessage('validation.IS_MONEY') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price_per_hour!: number;

  @ApiPropertyOptional({
    description:
      "The most one of these days costs. At least one hour's price; null for no cap.",
    example: 15000,
    nullable: true,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage('validation.IS_MONEY') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  daily_cap?: number | null;
}

/**
 * PUT /garage/garages/:id/settings: everything on the Lot Settings page at
 * once. The location and status stay with the Admin Panel.
 */
export class LotSettingsDto extends PickType(CreateParkingLotDto, [
  'name',
  'address',
  'city',
  'is_open_24h',
  'opening_time',
  'closing_time',
  'price_per_hour',
  'daily_cap',
  'free_cancellation_minutes',
  'has_cctv',
  'has_ev_charging',
  'is_covered',
  'is_accessible',
] as const) {
  @ApiProperty({
    description: `Special prices that haven't ended (up to ${MAX_PRICE_OVERRIDES}). They replace the ones saved before; past ones are kept as they were.`,
    type: [PriceOverrideDto],
  })
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  @ArrayMaxSize(MAX_PRICE_OVERRIDES, {
    message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
  })
  @ValidateNested({ each: true })
  @Type(() => PriceOverrideDto)
  price_overrides!: PriceOverrideDto[];
}
