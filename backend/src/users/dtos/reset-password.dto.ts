import { IsJWT } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsStrongPassword } from 'src/common/validators/decorators/is-strong-password.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The reset token returned by /user/local/verify-otp.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsJWT({ message: i18nValidationMessage('validation.IS_JWT') })
  token!: string;

  @ApiProperty({
    description: 'The new password.',
    example: 'NewSecurePass123!',
  })
  @IsStrongPassword()
  new_password!: string;
}
