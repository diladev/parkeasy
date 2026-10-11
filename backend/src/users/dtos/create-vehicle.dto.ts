import { IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";
import { NormalizePlate, Trim } from "src/common/transformers/normalize";
import { VEHICLE_TYPES } from "src/users/entities/vehicle.entity";

export class CreateVehicleDto {
    @ApiProperty({
        description: 'The brand (make) of the vehicle.',
        example: 'Toyota',
    })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    @MaxLength(40, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    brand!: string;

    @ApiProperty({
        description: 'The model of the vehicle.',
        example: 'Camry',
    })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(1, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    @MaxLength(40, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    model!: string;

    @ApiProperty({
        description: 'The year the vehicle was manufactured.',
        example: 2021,
    })
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1950, { message: i18nValidationMessage('validation.MIN') })
    @Max(new Date().getFullYear() + 1, { message: i18nValidationMessage('validation.MAX') })
    year!: number;

    @ApiProperty({
        description: 'The color of the vehicle.',
        example: 'Silver',
    })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    @MaxLength(30, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    color!: string;

    @ApiProperty({
        description: "The vehicle's license plate: letters (any alphabet), digits, spaces and dashes.",
        example: '22 SUL 12345',
    })
    @NormalizePlate()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @Matches(/^[\p{L}\p{N}][\p{L}\p{N}\s-]{1,14}$/u, { message: i18nValidationMessage('validation.PLATE_PATTERN') })
    license_plate!: string;

    @ApiPropertyOptional({
        description: 'The vehicle body type.',
        example: 'sedan',
        enum: VEHICLE_TYPES,
        default: 'sedan',
    })
    @IsOptional()
    @IsIn(VEHICLE_TYPES, { message: i18nValidationMessage('validation.IS_IN') })
    type?: string;
}
