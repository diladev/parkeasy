import { IsEmail, IsIn, IsISO8601, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";
import { NormalizeEmail, Trim } from "src/common/transformers/normalize";
import { IsStrongPassword } from "src/common/validators/decorators/is-strong-password.decorator";

/**
 * For the future admin portal, when an admin creates an account directly.
 * Customers sign up with RegisterUserDto.
 */
export class CreateUserDto {
    @ApiProperty({ description: 'The name of the user.', example: 'Dilan Karimi' })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @MinLength(2, { message: i18nValidationMessage('validation.MIN_LENGTH') })
    @MaxLength(60, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    name!: string;

    @ApiProperty({ description: 'The username: 3-30 lowercase letters, digits, _ or .', example: 'dilan_karimi' })
    @Matches(/^[a-z0-9_.]{3,30}$/, { message: i18nValidationMessage('validation.USERNAME_PATTERN') })
    username!: string;

    @ApiProperty({ description: "The user's email address.", example: 'dilan@example.com' })
    @NormalizeEmail()
    @IsEmail({}, { message: i18nValidationMessage('validation.IS_EMAIL') })
    @MaxLength(254, { message: i18nValidationMessage('validation.MAX_LENGTH') })
    email!: string;

    @ApiProperty({ description: "The user's phone number.", example: '+964 750 123 4567' })
    @Trim()
    @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
    @Matches(/^\+?[0-9][0-9\s-]{6,19}$/, { message: i18nValidationMessage('validation.IS_PHONE') })
    phone!: string;

    @ApiProperty({ description: "The user's password.", example: 'Password123!' })
    @IsStrongPassword()
    password!: string;

    @ApiPropertyOptional({ description: "The user's date of birth (YYYY-MM-DD).", example: '1999-04-21' })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: i18nValidationMessage('validation.DATE_PATTERN') })
    @IsISO8601({ strict: true }, { message: i18nValidationMessage('validation.DATE_PATTERN') })
    date_of_birth?: string;

    @ApiPropertyOptional({ description: 'Account status.', example: 'active', enum: ['active', 'inactive', 'suspended'] })
    @IsOptional()
    @IsIn(['active', 'inactive', 'suspended'], { message: i18nValidationMessage('validation.IS_IN') })
    status?: string;
}
