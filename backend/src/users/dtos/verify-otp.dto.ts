import { IsEmail, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { NormalizeEmail } from 'src/common/transformers/normalize';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email address the code was sent to.',
    example: 'dilan@example.com',
  })
  @NormalizeEmail()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email!: string;

  @ApiProperty({
    description: 'The six-digit code from the email.',
    example: '123456',
  })
  @Matches(/^\d{6}$/, {
    message: i18nValidationMessage('validation.OTP_PATTERN'),
  })
  otp!: string;
}
