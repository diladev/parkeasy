import { MaxLength, MinLength, IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateVehicleDto {
    @IsString()
    @MinLength(2, { message: '$property.MIN,$constraint1' })
    @MaxLength(40, { message: '$property.MAX,$constraint1' })
    brand!: string;

    @IsString()
    @MinLength(2, { message: '$property.MIN,$constraint1' })
    @MaxLength(40, { message: '$property.MAX,$constraint1' })
    model!: string;

    @IsNumber()
    @IsNotEmpty()
    year!: number;

    @IsString()
    @MinLength(2, { message: '$property.MIN,$constraint1' })
    @MaxLength(40, { message: '$property.MAX,$constraint1' })
    color!: string;

    @IsString()
    @MinLength(2, { message: '$property.MIN,$constraint1' })
    @MaxLength(40, { message: '$property.MAX,$constraint1' })
    license_plate!: string;
}