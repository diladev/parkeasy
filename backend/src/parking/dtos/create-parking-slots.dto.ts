import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { CreateParkingSlotDto } from './create-parking-slot.dto';

export class CreateParkingSlotsDto {
  @ApiProperty({
    description:
      'The parking slots to create (1-100). A slot number can repeat on different levels.',
    type: [CreateParkingSlotDto],
    example: [
      {
        slot_number: 'A01',
        level: 'B1',
      },
      {
        slot_number: 'A02',
        level: 'B1',
      },
      {
        slot_number: 'A01',
        level: 'G',
      },
    ],
    maxItems: 100,
  })
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  @ArrayMinSize(1, {
    message: i18nValidationMessage('validation.ARRAY_MIN_SIZE'),
  })
  @ArrayMaxSize(100, {
    message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
  })
  @ValidateNested({ each: true })
  @Type(() => CreateParkingSlotDto)
  slots!: CreateParkingSlotDto[];
}
