import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { NormalizeEmail, Trim } from 'src/common/transformers/normalize';
import { CreateParkingLotDto } from './create-parking-lot.dto';
import { LEVEL_PATTERN } from './create-parking-slot.dto';

/** Most slots one level can start with; more can be added from the Garage Portal later. */
export const MAX_SLOTS_PER_LEVEL = 200;
export const MAX_LEVELS = 10;

export class GarageLevelDto {
  @ApiProperty({
    description: 'B1, B2... (basements), G (ground), F1, F2... (floors).',
    example: 'G',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @Matches(LEVEL_PATTERN, {
    message: i18nValidationMessage('validation.LEVEL_PATTERN'),
  })
  level!: string;

  @ApiProperty({
    description: 'How many slots to create on this level, numbered A01, A02...',
    example: 20,
  })
  @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
  @Min(1, { message: i18nValidationMessage('validation.MIN') })
  @Max(MAX_SLOTS_PER_LEVEL, {
    message: i18nValidationMessage('validation.MAX'),
  })
  slots!: number;
}

export class GarageOwnerDto {
  @ApiProperty({ description: "The owner's full name.", example: 'Hana Rauf' })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(60, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  name!: string;

  @ApiProperty({
    description:
      'An existing garage owner with this email is linked; otherwise a new owner account is opened.',
    example: 'hana@example.com',
  })
  @NormalizeEmail()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @MaxLength(254, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  email!: string;

  @ApiProperty({
    description: "The owner's phone number.",
    example: '+964 750 123 4567',
  })
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Matches(/^\+?[0-9][0-9\s-]{6,19}$/, {
    message: i18nValidationMessage('validation.IS_PHONE'),
  })
  phone!: string;
}

/** POST /admin/garages: the lot, its levels and (optionally) who runs it, in one step. */
export class AdminCreateGarageDto extends CreateParkingLotDto {
  @ApiProperty({
    description: `The levels and how many slots each has (1-${MAX_LEVELS} levels, each level once).`,
    type: [GarageLevelDto],
    example: [
      { level: 'G', slots: 20 },
      { level: 'B1', slots: 30 },
    ],
  })
  @IsArray({ message: i18nValidationMessage('validation.IS_ARRAY') })
  @ArrayMinSize(1, {
    message: i18nValidationMessage('validation.ARRAY_MIN_SIZE'),
  })
  @ArrayMaxSize(MAX_LEVELS, {
    message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
  })
  @ArrayUnique((entry: GarageLevelDto) => entry?.level, {
    message: i18nValidationMessage('validation.ARRAY_UNIQUE'),
  })
  @ValidateNested({ each: true })
  @Type(() => GarageLevelDto)
  levels!: GarageLevelDto[];

  @ApiPropertyOptional({
    description: 'Leave out to add the garage without an owner.',
    type: GarageOwnerDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GarageOwnerDto)
  owner?: GarageOwnerDto;
}
