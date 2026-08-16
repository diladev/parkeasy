import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateParkingLotDto {
    @ApiProperty({
        description: 'The name of the parking lot.',
        example: 'City Center Parking',
    })
    @IsString({ message: i18nValidationMessage('$validation.STRING_PATTERN') })
    @MaxLength(100, { message: i18nValidationMessage('$validation.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$validation.MIN,$constraint1') })
    name!: string;

    @ApiProperty({
        description: 'The address of the parking lot.',
        example: 'Salim Street, Sulaymaniyah',
    })
    @IsString({ message: i18nValidationMessage('$validation.STRING_PATTERN') })
    @MaxLength(255, { message: i18nValidationMessage('$validation.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$validation.MIN,$constraint1') })
    address!: string;

    @ApiProperty({
        description: 'The latitude of the parking lot.',
        example: 35.5571,
    })
    @IsNumber({}, { message: i18nValidationMessage('$validation.NUM_PATTERN') })
    latitude!: number;

    @ApiProperty({
        description: 'The longitude of the parking lot.',
        example: 45.4356,
    })
    @IsNumber({}, { message: i18nValidationMessage('$validation.NUM_PATTERN') })
    longitude!: number;

    @ApiProperty({
        description: 'Whether the parking lot is open 24 hours a day.',
        example: true,
    })
    @IsBoolean({ message: i18nValidationMessage('$validation.BOOLEAN_PATTERN') })
    is_open_24h!: boolean;

    @ApiProperty({
        description: 'The opening time of the parking lot.',
        example: '08:00',
    })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: i18nValidationMessage('$validation.TIME_PATTERN'),
    })
    opening_time!: string;

    @ApiProperty({
        description: 'The closing time of the parking lot.',
        example: '22:00',
    })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: i18nValidationMessage('$validation.TIME_PATTERN'),
    })
    closing_time!: string;

    @ApiProperty({
        description: 'The price per hour for parking.',
        example: 1.5,
    })
    @IsNumber({}, { message: i18nValidationMessage('$validation.NUM_PATTERN') })
    price_per_hour!: number;

    @ApiProperty({
        description: 'Whether the parking lot has CCTV surveillance.',
        example: true,
    })
    @IsBoolean({ message: i18nValidationMessage('$validation.BOOLEAN_PATTERN') })
    has_cctv!: boolean;

    @ApiProperty({
        description: 'Whether the parking lot has electric vehicle charging facilities.',
        example: false,
    })
    @IsBoolean({ message: i18nValidationMessage('$validation.BOOLEAN_PATTERN') })
    has_ev_charging!: boolean;

    @ApiProperty({
        description: 'Whether the parking lot is covered.',
        example: true,
    })
    @IsBoolean({ message: i18nValidationMessage('$validation.BOOLEAN_PATTERN') })
    is_covered!: boolean;

    @ApiProperty({
        description: 'Whether the parking lot is accessible.',
        example: true,
    })
    @IsBoolean({ message: i18nValidationMessage('$validation.BOOLEAN_PATTERN') })
    is_accessible!: boolean;
}