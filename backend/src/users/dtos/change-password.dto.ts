import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsStrongPassword } from 'src/common/validators/decorators/is-strong-password.decorator';

export class ChangePasswordDto {

    @ApiProperty({
        description: "The user's current password.",
        example: 'OldPassword123!',
    })
    @IsStrongPassword({
        message: i18nValidationMessage(
            'validation.PASSWORD_PATTERN',
        ),
    })
    old_password!: string;


    @ApiProperty({
        description: "The user's new password.",
        example: 'NewPassword123!',
    })
    @IsStrongPassword({
        message: i18nValidationMessage(
            'validation.PASSWORD_PATTERN',
        ),
    })
    new_password!: string;
}