import {
  IsEmail,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { NormalizeEmail, Trim } from 'src/common/transformers/normalize';

/** Every field is optional: only the fields that are sent get updated. */
export class EditUserDto {
  @ApiPropertyOptional({
    description: "The user's full name.",
    example: 'Dilan Karimi',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
  @MaxLength(60, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  name?: string;

  @ApiPropertyOptional({
    description: "The user's email address.",
    example: 'dilan@example.com',
  })
  @IsOptional()
  @NormalizeEmail()
  @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
  @MaxLength(254, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  email?: string;

  @ApiPropertyOptional({
    description: "The user's phone number.",
    example: '+964 750 123 4567',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @Matches(/^\+?[0-9][0-9\s-]{6,19}$/, {
    message: i18nValidationMessage('validation.IS_PHONE'),
  })
  phone?: string;

  // @IsOptional() skips validation for both undefined and null,
  // so sending null is how the app clears the date.
  @ApiPropertyOptional({
    description:
      "The user's date of birth (YYYY-MM-DD). Send null to clear it.",
    example: '1999-04-21',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: i18nValidationMessage('validation.DATE_PATTERN'),
  })
  @IsISO8601(
    { strict: true },
    { message: i18nValidationMessage('validation.DATE_PATTERN') },
  )
  date_of_birth?: string | null;
}
