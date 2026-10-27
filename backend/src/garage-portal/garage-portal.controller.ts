import { Controller, Get, Header, Param, UseGuards } from '@nestjs/common';
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
import { GaragePortalService } from './garage-portal.service';

/** The Garage Portal. Garage owners only, and only their own garages. */
@ApiTags('Garage Portal')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
@RequirePermissions([PERMISSIONS.GARAGE_ACCESS])
@Controller('garage/garages')
export class GaragePortalController {
  constructor(private readonly portal: GaragePortalService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: "The signed-in owner's garages." })
  myGarages(@CurrentUser() owner: AuthenticatedUser) {
    return this.portal.myGarages(owner.id);
  }

  @Get(':id/dashboard')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Occupancy, today and this week, 7-day revenue, levels and the latest bookings of one owned garage.',
  })
  dashboard(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.portal.dashboard(owner.id, id);
  }
}
