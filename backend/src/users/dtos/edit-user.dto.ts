import { MaxLength, MinLength, IsEmail, Matches, IsNumber, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { i18nValidationMessage } from "nestjs-i18n";


export class EditUserDto {
    @ApiPropertyOptional({
        description: "The user's full name.",
        example: 'John Doe',
    })
    @IsOptional()
    @MaxLength(50, { message: i18nValidationMessage('$property.MAX,$constraint1') })
    @MinLength(3, { message: i18nValidationMessage('$property.MIN,$constraint1') })
    name?: string;

    @ApiPropertyOptional({
        description: "The user's email address.",
        example: 'john.doe@example.com',
    })
    @IsOptional()
    @IsEmail({}, { message: i18nValidationMessage('$property.EMAIL_PATTERN') })
    email?: string;

    @ApiPropertyOptional({
        description: "The user's phone number.",
        example: 1234567890,
    })
    @IsOptional()
    @IsNumber({}, { message: i18nValidationMessage('$property.NUM_PATTERN') })
    phone?: number;

    @ApiPropertyOptional({
        description: "The user's date of birth.",
        example: '1990-01-01',
    })
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: i18nValidationMessage('$property.DATE_PATTERN') })
    date_of_birth?: string;
}