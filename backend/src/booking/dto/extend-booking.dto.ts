import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { PAYMENT_METHODS } from '../entities/booking.entity';
import { MAX_BOOKING_HOURS } from './create-booking.dto';

export class ExtendBookingDto {
    @ApiProperty({ example: 1, minimum: 1, maximum: MAX_BOOKING_HOURS - 1 })
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @Max(MAX_BOOKING_HOURS - 1, { message: i18nValidationMessage('validation.MAX') })
    extra_hours!: number;

    @ApiProperty({ example: 'wallet', enum: PAYMENT_METHODS })
    @IsIn(PAYMENT_METHODS, { message: i18nValidationMessage('validation.IS_IN') })
    payment_method!: string;
}
