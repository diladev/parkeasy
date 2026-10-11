import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { NOTIFICATION_TYPES } from '../entities/notification.entity';

export class NotificationQueryDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: NOTIFICATION_TYPES, description: 'Only this category. Leave empty for all.' })
    @IsOptional()
    @IsIn(NOTIFICATION_TYPES, { message: i18nValidationMessage('validation.IS_IN') })
    type?: string;
}
