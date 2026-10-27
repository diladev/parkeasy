import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { UpperCaseTrim } from 'src/common/transformers/normalize';

/** B1, B2... (basements), G (ground), F1, F2... (floors). */
export const LEVEL_PATTERN = /^(B[1-9]\d*|G|F[1-9]\d*)$/;

export class CreateParkingSlotDto {
  @ApiProperty({
    description: 'The number assigned to the parking slot.',
    example: 'A01',
  })
  @UpperCaseTrim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(1, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(10, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  slot_number!: string;

  @ApiProperty({
    description:
      'The level where the parking slot is located: B1, B2... G, F1, F2...',
    example: 'B1',
  })
  @UpperCaseTrim()
  @Matches(LEVEL_PATTERN, {
    message: i18nValidationMessage('validation.LEVEL_PATTERN'),
  })
  level!: string;
}
