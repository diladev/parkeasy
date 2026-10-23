import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

/** PATCH /notifications/settings: only the switches being changed. */
export class UpdateNotificationSettingsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    booking_reminders?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    expiry_alerts?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    offers?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    loyalty_rewards?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    booking_receipt_emails?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: i18nValidationMessage('validation.IS_BOOLEAN') })
    newsletter?: boolean;
}
