import { ApiPropertyOptional, PickType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import { ROLES, type Role } from 'src/auth/permissions';
import { PaginationQueryDto } from 'src/common/pagination/dto/pagination-query.dto';
import { Trim } from 'src/common/transformers/normalize';

/** GET /admin/users?role=driver&q=aram&page=1&pageSize=10 */
export class AdminUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ROLES })
  @IsOptional()
  @IsIn(ROLES, { message: i18nValidationMessage('validation.IS_IN') })
  role?: Role;

  @ApiPropertyOptional({
    description: 'Part of the name, email, username or phone number.',
    example: 'aram',
  })
  @IsOptional()
  @Trim()
  @IsString({ message: i18nValidationMessage('validation.IS_STRING') })
  @MaxLength(100, { message: i18nValidationMessage('validation.MAX_LENGTH') })
  q?: string;
}

/** GET /admin/users/export: the same filters, every matching account. */
export class AdminUsersExportQueryDto extends PickType(AdminUsersQueryDto, [
  'role',
  'q',
] as const) {}
