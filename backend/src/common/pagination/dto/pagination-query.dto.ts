import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { MAX_PAGE_SIZE } from 'src/common/pagination/model-pagination';

/** `?page=2&pageSize=20`, shared by every paginated list. */
export class PaginationQueryDto {
    @ApiPropertyOptional({ default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    page: number = 1;

    @ApiPropertyOptional({ default: 10, minimum: 1, maximum: MAX_PAGE_SIZE })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: i18nValidationMessage('validation.IS_INT') })
    @Min(1, { message: i18nValidationMessage('validation.MIN') })
    @Max(MAX_PAGE_SIZE, { message: i18nValidationMessage('validation.MAX') })
    pageSize: number = 10;
}
