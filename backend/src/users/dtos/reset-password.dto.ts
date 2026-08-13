import { Matches, IsString } from "class-validator";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";
import { ApiProperty } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";
import { IsValidLanguage } from "src/common/validators/decorators/is-valid-language.decorator";

export class ResetPasswordDto {
    @ApiProperty({
        description: "The user's preferred language ('en' or 'ckb').",
        example: 'en',
    })
    @IsValidLanguage({ message: i18nValidationMessage('validation.LANGUAGE_NOT_SUPPORTED') })
    language!: string;

    @ApiProperty({
        description: 'The password reset token.',
        example: 'example-token',
    })
    @IsString()
    token!: string;

    @ApiProperty({
        description: "The user's new password.",
        example: 'NewSecurePass123!',
    })
    @IsStrongPassword({ message: i18nValidationMessage('validation.PASSWORD_PATTERN') })
    new_password!: string;

}