import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  PermissionsGuard,
  RequirePermissions,
} from 'src/auth/guards/permissions.guard';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { PERMISSIONS } from 'src/auth/permissions';
import { AdminOverviewService } from './admin-overview.service';

/** The Admin Panel's Overview page. Admins only; the role is checked on every request. */
@ApiTags('Admin · Overview')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
@RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
@Controller('admin/overview')
export class AdminOverviewController {
  constructor(private readonly adminOverview: AdminOverviewService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Platform totals, this month and today, 7-day revenue, top garages and recent sign-ups.',
  })
  overview() {
    return this.adminOverview.overview();
  }
}
