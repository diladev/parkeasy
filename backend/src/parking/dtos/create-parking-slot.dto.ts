import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength, Matches } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateParkingSlotDto {
    @ApiProperty({
        description: 'The number assigned to the parking slot.',
        example: 'A01',
    })
    @IsString({ message: i18nValidationMessage('$property.STRING_PATTERN') })
    @MaxLength(10, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(1, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    slot_number!: string;

    @ApiProperty({
        description: 'The level where the parking slot is located.',
        example: 'B1',
    })
    @Matches(/^(B[1-9]\d*|G|F[1-9]\d*)$/, {
        message: i18nValidationMessage('$validation.LEVEL_PATTERN'),
    })
    level!: string;
}