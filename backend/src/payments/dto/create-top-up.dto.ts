import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/** Smallest and largest single top-up, in whole Iraqi dinars. */
export const MIN_TOP_UP = 1_000;
export const MAX_TOP_UP = 1_000_000;

export class CreateTopUpDto {
  @ApiProperty({
    description: `Whole Iraqi dinars, from ${MIN_TOP_UP} to ${MAX_TOP_UP}.`,
    example: 10000,
  })
  @IsInt({ message: i18nValidationMessage('validation.IS_MONEY') })
  @Min(MIN_TOP_UP, { message: i18nValidationMessage('validation.MIN') })
  @Max(MAX_TOP_UP, { message: i18nValidationMessage('validation.MAX') })
  amount!: number;
}
