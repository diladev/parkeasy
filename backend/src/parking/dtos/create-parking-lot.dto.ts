import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
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
import {
  DEFAULT_FREE_CANCELLATION_MINUTES,
  MAX_FREE_CANCELLATION_MINUTES,
} from 'src/booking/cancellation';
import { Trim } from 'src/common/transformers/normalize';

/** "HH:mm", 24-hour clock. */
export const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateParkingLotDto {
  @ApiProperty({
    description: 'The name of the parking lot.',
    example: 'City Center Parking',
  })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(3, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  name!: string;

  @ApiProperty({
    description: 'The address of the parking lot.',
    example: 'Salim Street, Sulaymaniyah',
  })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(3, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(255, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  address!: string;

  @ApiProperty({
    description: 'The city the lot is in.',
    example: 'Sulaymaniyah',
  })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  city!: string;

  @ApiProperty({
    description: 'The latitude of the parking lot.',
    example: 35.5571,
  })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(-90, { message: i18nValidationMessage('validation.MIN') })
  @Max(90, { message: i18nValidationMessage('validation.MAX') })
  latitude!: number;

  @ApiProperty({
    description: 'The longitude of the parking lot.',
    example: 45.4356,
  })
  @IsNumber({}, { message: i18nValidationMessage('validation.IS_NUMBER') })
  @Min(-180, { message: i18nValidationMessage('validation.MIN') })
  @Max(180, { message: i18nValidationMessage('validation.MAX') })
  longitude!: number;

  @ApiProperty({
    description: 'Whether the parking lot is open 24 hours a day.',
    example: true,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  is_open_24h!: boolean;

  @ApiProperty({
    description:
      'Opening time, local time (HH:mm). Ignored when is_open_24h is true.',
    example: '08:00',
  })
  @Matches(TIME_PATTERN, {
    message: i18nValidationMessage('validation.TIME_PATTERN'),
  })
  opening_time!: string;

  @ApiProperty({
    description:
      'Closing time, local time (HH:mm). Earlier than the opening time means it closes after midnight.',
    example: '22:00',
  })
  @Matches(TIME_PATTERN, {
    message: i18nValidationMessage('validation.TIME_PATTERN'),
  })
  closing_time!: string;

  @ApiProperty({
    description: 'The price per hour for parking, in whole Iraqi dinars.',
    example: 1500,
  })
  @IsInt({ message: i18nValidationMessage('validation.IS_MONEY') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  price_per_hour!: number;

  @ApiPropertyOptional({
    description:
      'How many minutes after a booking starts it can still be cancelled with a full refund. 0 means never.',
    example: DEFAULT_FREE_CANCELLATION_MINUTES,
    default: DEFAULT_FREE_CANCELLATION_MINUTES,
  })
  @IsOptional()
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(0, { message: i18nValidationMessage('validation.MIN') })
  @Max(MAX_FREE_CANCELLATION_MINUTES, {
    message: i18nValidationMessage('validation.MAX'),
  })
  free_cancellation_minutes?: number;

  @ApiProperty({
    description: 'Whether the parking lot has CCTV surveillance.',
    example: true,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  has_cctv!: boolean;

  @ApiProperty({
    description:
      'Whether the parking lot has electric vehicle charging facilities.',
    example: false,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  has_ev_charging!: boolean;

  @ApiProperty({
    description: 'Whether the parking lot is covered.',
    example: true,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  is_covered!: boolean;

  @ApiProperty({
    description: 'Whether the parking lot is wheelchair accessible.',
    example: true,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
  is_accessible!: boolean;
}
