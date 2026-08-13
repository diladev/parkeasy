import { MaxLength, MinLength, IsEmail, Matches, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
    @ApiProperty({
        description: 'USER_NAME',
        example: 'John Doe',
    })
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    name!: string;

    @ApiProperty({
        description: 'USER_USERNAME',
        example: 'johndoe',
    })
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    username!: string;

    @ApiProperty({
        description: 'USER_EMAIL',
        example: 'johndoe@example.com',
    })
    @IsEmail({}, { message: i18nValidationMessage('$property.EMAIL_PATTERN') })
    email!: string;

    @ApiProperty({
        description: 'USER_PHONE',
        example: 1234567890,
    })
    @IsNumber({}, { message: i18nValidationMessage('$property.NUM_PATTERN') })
    phone!: number;

    @ApiProperty({
        description: 'USER_PASSWORD',
        example: 'Password123!',
    })
    @IsStrongPassword({ message: i18nValidationMessage('validation.PASSWORD_PATTERN') })
    password!: string;

    @ApiProperty({
        description: 'USER_DATE_OF_BIRTH',
        example: '1990-01-01',
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: i18nValidationMessage('$property.DATE_PATTERN') })
    date_of_birth!: string;
}