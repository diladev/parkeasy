import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PORTALS, type Portal } from 'src/auth/permissions';
import { NormalizeEmail } from 'src/common/transformers/normalize';

export class UserLocalLoginDto {
  @ApiProperty({
    description: "The user's email address.",
    example: 'dilan@example.com',
  })
  @NormalizeEmail()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  email!: string;

  // No strength rule here: login only checks the password against the hash.
  // Enforcing the policy at login would lock out accounts created before a
  // policy change and reveal the rules to anyone probing the endpoint.
  @ApiProperty({
    description: "The user's account password.",
    example: 'SecurePass123!',
  })
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.IS_NOT_EMPTY') })
  @MaxLength(128, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  password!: string;

  /**
   * Sent by the web portals. Only accounts allowed into that portal get a
   * session; the mobile app leaves it out.
   */
  @ApiPropertyOptional({
    description:
      'The web portal signing in. Accounts without access to it are refused.',
    enum: PORTALS,
  })
  @IsOptional()
  @IsIn(PORTALS, { message: i18nValidationMessage('validation.IS_IN') })
  portal?: Portal;
}
