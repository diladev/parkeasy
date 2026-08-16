import { MaxLength, MinLength, IsEmail, Matches, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateUserDto {
    @ApiProperty({
        description: 'The name of the user.',
        example: 'John Doe',
    })
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    name!: string;

    @ApiProperty({
        description: 'The username of the user.',
        example: 'johndoe',
    })
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    username!: string;

    @ApiProperty({
        description: `The user's email address.`,
        example: 'johndoe@example.com',
    })
    @IsEmail({}, { message: i18nValidationMessage('$property.EMAIL_PATTERN') })
    email!: string;

    @ApiProperty({
        description: `The user's phone number.`,
        example: 1234567890,
    })
    @IsNumber({}, { message: i18nValidationMessage('$property.NUM_PATTERN') })
    phone!: number;

    @ApiProperty({
        description: `The user's password.`,
        example: 'Password123!',
    })
    @IsStrongPassword({ message: i18nValidationMessage('validation.PASSWORD_PATTERN') })
    password!: string;

    @ApiProperty({
        description: `The user's date of birth.`,
        example: '1990-01-01',
    })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: i18nValidationMessage('$property.DATE_PATTERN') })
    date_of_birth!: string;
}