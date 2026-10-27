import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsStrongPassword } from 'src/common/validators/decorators/is-strong-password.decorator';

export class ChangePasswordDto {
  // Only compared with the stored hash, so no strength rule here: an account
  // created under an older, weaker policy must still be able to change it.
  @ApiProperty({
    description: "The user's current password.",
    example: 'OldPassword123!',
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @MaxLength(128, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  old_password!: string;

  @ApiProperty({
    description: "The user's new password.",
    example: 'NewPassword123!',
  })
  @IsStrongPassword()
  new_password!: string;
}
