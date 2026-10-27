import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { NormalizeEmail } from 'src/common/transformers/normalize';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the account.',
    example: 'dilan@example.com',
  })
  @NormalizeEmail()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email!: string;
}
