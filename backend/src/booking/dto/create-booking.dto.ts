import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { BOOKING_PAYMENT_METHODS } from '../entities/booking.entity';

/** Longest booking, including extensions. */
export const MAX_BOOKING_HOURS = 24;

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  parking_lot_id!: number;

  @ApiProperty({ example: 1, description: 'Must be a slot of parking_lot_id.' })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  parking_slot_id!: number;

  @ApiProperty({ example: 1, description: 'One of your own vehicles.' })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  vehicle_id!: number;

  @ApiProperty({ example: 2, minimum: 1, maximum: MAX_BOOKING_HOURS })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @Max(MAX_BOOKING_HOURS, { message: i18nValidationMessage('validation.MAX') })
  duration_hours!: number;

  @ApiProperty({ example: 'wallet', enum: BOOKING_PAYMENT_METHODS })
  @IsIn(BOOKING_PAYMENT_METHODS, {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  payment_method!: string;
}
