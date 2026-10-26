import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import {
  PermissionsGuard,
  RequirePermissions,
} from 'src/auth/guards/permissions.guard';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { PERMISSIONS } from 'src/auth/permissions';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { AdminGaragesService } from './admin-garages.service';
import { AdminGaragesQueryDto } from './dtos';

/** The Admin Panel's Garages page. Admins only; the role is checked on every request. */
@ApiTags('Admin · Garages')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
@RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
@Controller('admin/garages')
export class AdminGaragesController {
  constructor(private readonly adminGarages: AdminGaragesService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Garages with owner, slots, rating, 30-day revenue and status counts.',
  })
  list(@Query() query: AdminGaragesQueryDto) {
    return this.adminGarages.list(query);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pending -> approved: drivers can find and book it.',
  })
  approve(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminGarages.changeStatus(id, 'approve', admin.id);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Approved -> suspended: hidden from the app; existing bookings continue.',
  })
  suspend(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminGarages.changeStatus(id, 'suspend', admin.id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspended -> approved.' })
  restore(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.adminGarages.changeStatus(id, 'restore', admin.id);
  }
}
