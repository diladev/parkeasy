import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import {
  WALK_IN_PAYMENT_METHODS,
  type WalkInPaymentMethod,
} from 'src/booking/entities/booking.entity';
import { NormalizePlate } from 'src/common/transformers/normalize';

/** POST /garage/garages/:id/slots/:slotId/walk-in */
export class StartWalkInDto {
  @ApiProperty({
    description:
      "The car's license plate, as on a vehicle: letters (any alphabet), digits, spaces and dashes.",
    example: '22 SUL 12345',
  })
  @NormalizePlate()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Matches(/^[\p{L}\p{N}][\p{L}\p{N}\s-]{1,14}$/u, {
    message: i18nValidationMessage('validation.PLATE_PATTERN'),
  })
  plate!: string;
}

/** POST /garage/garages/:id/walk-ins/:bookingId/end */
export class EndWalkInDto {
  @ApiProperty({ enum: WALK_IN_PAYMENT_METHODS, example: 'cash' })
  @IsIn(WALK_IN_PAYMENT_METHODS, {
    message: i18nValidationMessage('validation.IS_IN'),
  })
  payment_method!: WalkInPaymentMethod;
}
