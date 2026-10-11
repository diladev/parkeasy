import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";
import { NormalizeEmail, Trim } from "src/common/transformers/normalize";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";

export class RegisterUserDto {
    @ApiProperty({
        description: "The user's full name.",
        example: 'Dilan Karimi',
    })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    @MaxLength(60, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    name!: string;

    @ApiProperty({
        description: "The user's email address. Used to sign in.",
        example: 'dilan@example.com',
    })
    @NormalizeEmail()
    @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
    @MaxLength(254, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    email!: string;

    @ApiProperty({
        description: "The user's phone number, digits with an optional leading +. Spaces and dashes are allowed.",
        example: '+964 750 123 4567',
    })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @Matches(/^\+?[0-9][0-9\s-]{6,19}$/, { message: i18nValidationMessage('validation.IS_PHONE') })
    phone!: string;

    @ApiProperty({
        description: "The account password: 8-64 characters with an uppercase letter, a lowercase letter, a number and a symbol.",
        example: 'SecurePass123!',
    })
    @IsStrongPassword()
    password!: string;
}
