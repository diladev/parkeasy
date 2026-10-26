import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import {
  PermissionsGuard,
  RequirePermissions,
} from 'src/auth/guards/permissions.guard';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { PERMISSIONS } from 'src/auth/permissions';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersExportQueryDto, AdminUsersQueryDto } from './dtos';

/** The Admin Panel's Users pages. Admins only; the role is checked on every request. */
@ApiTags('Admin · Users')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
@RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary: 'Accounts with bookings, wallet balance and counts per role.',
  })
  list(@Query() query: AdminUsersQueryDto) {
    return this.adminUsers.list(query);
  }

  // Before ':id', so "export" isn't read as an id.
  @Get('export')
  @Header('Cache-Control', 'no-store')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiProduces('text/csv')
  @ApiOperation({ summary: 'The matching accounts as a CSV file.' })
  async export(
    @Query() query: AdminUsersExportQueryDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const csv = await this.adminUsers.exportCsv(query);
    const day = new Date().toISOString().slice(0, 10);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="parkeasy-users-${day}.csv"`,
    );
    return csv;
  }

  @Get(':id')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'One account: stats, vehicles, wallet activity, recent bookings and owned garages.',
  })
  detail(@Param('id', ParseIdPipe) id: number) {
    return this.adminUsers.detail(id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Active -> suspended: signed out everywhere and unable to sign in.',
  })
  suspend(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminUsers.changeStatus(id, 'suspend', admin.id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspended -> active.' })
  restore(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminUsers.changeStatus(id, 'restore', admin.id);
  }

  @Post(':id/password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emails the account a password reset code.' })
  passwordReset(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminUsers.sendPasswordReset(id, admin.id);
  }
}
