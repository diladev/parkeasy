import { MaxLength, MinLength, IsEmail, IsNumber } from "class-validator";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";
import { IsValidLanguage } from "src/common/validators/decorators/is-valid-language.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";

export class RegisterUserDto {
    @ApiProperty({
        description: "The user's preferred language ('en' or 'ckb').",
        example: 'en',
    })
    @IsValidLanguage({ message: i18nValidationMessage('validation.LANGUAGE_NOT_SUPPORTED') })
    language!: string;

    @ApiProperty({
        description: "The user's full name.",
        example: 'John Doe',
    })
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    name!: string;

    @ApiProperty({
        description: "The user's email address.",
        example: 'john.doe@example.com',
    })
    @IsEmail({}, { message: i18nValidationMessage('$property.EMAIL_PATTERN') })
    email!: string;

    @ApiProperty({
        description: "The user's phone number.",
        example: 1234567890,
    })
    @IsNumber({}, { message: i18nValidationMessage('$property.NUM_PATTERN') })
    phone!: number;

    @ApiProperty({
        description: "The user's account password.",
        example: 'SecurePass123!',
    })
    @IsStrongPassword({ message: i18nValidationMessage('validation.PASSWORD_PATTERN') })
    password!: string;

}