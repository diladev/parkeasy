import { MaxLength, MinLength, IsNotEmpty, IsString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateVehicleDto {
    @ApiProperty({
        description: 'The brand of the vehicle.',
        example: 'Toyota',
    })
    @IsString()
    @MinLength(2, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    @MaxLength(40, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    brand!: string;

    @ApiProperty({
        description: 'The model of the vehicle.',
        example: 'Corolla',
    })
    @IsString()
    @MinLength(2, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    @MaxLength(40, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    model!: string;

    @ApiProperty({
        description: 'The year the vehicle was manufactured.',
        example: 2020,
    })
    @IsNumber()
    @IsNotEmpty()
    year!: number;

    @ApiProperty({
        description: 'The color of the vehicle.',
        example: 'Red',
    })
    @IsString()
    @MinLength(2, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    @MaxLength(40, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    color!: string;

    @ApiProperty({
        description: "The vehicle's license plate number.",
        example: 'ABC1234',
    })
    @IsString()
    @MinLength(2, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    @MaxLength(40, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    license_plate!: string;
}