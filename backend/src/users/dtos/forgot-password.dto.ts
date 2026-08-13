import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";
import { IsValidLanguage } from "src/common/validators/decorators/is-valid-language.decorator";

export class ForgotPasswordDto {
    @ApiProperty({
        description: "The user's preferred language ('en' or 'ckb').",
        example: 'en',
    })
    @IsValidLanguage({ message: i18nValidationMessage('validation.LANGUAGE_NOT_SUPPORTED') })
    language!: string;

    @ApiProperty({
        description: "The user's email address.",
        example: 'john.doe@example.com',
    })
    @IsEmail({}, { message: i18nValidationMessage('$property.EMAIL_PATTERN') })
    email!: string;
}