import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { EndWalkInDto, StartWalkInDto } from './dtos/walk-in.dto';
import { GaragePortalService } from './garage-portal.service';
import { GarageSlotsService } from './garage-slots.service';

/** The Garage Portal. Garage owners only, and only their own garages. */
@ApiTags('Garage Portal')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
@RequirePermissions([PERMISSIONS.GARAGE_ACCESS])
@Controller('garage/garages')
export class GaragePortalController {
  constructor(
    private readonly portal: GaragePortalService,
    private readonly slots: GarageSlotsService,
  ) {}

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

  @Get(':id/slots')
  @Header('Cache-Control', 'no-store')
  @ApiOperation({
    summary:
      'Every slot of one owned garage with its status, and the booking holding it.',
  })
  liveSlots(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.slots.liveSlots(owner.id, id);
  }

  @Post(':id/slots/:slotId/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Take a free slot out of service. Refused while it is booked or a car is parked.',
  })
  blockSlot(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Param('slotId', ParseIdPipe) slotId: number,
  ) {
    return this.slots.changeSlot(owner.id, id, slotId, 'block');
  }

  @Post(':id/slots/:slotId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Make a blocked slot, or one a car parked in without a booking, free again. Refused while it is booked.',
  })
  releaseSlot(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Param('slotId', ParseIdPipe) slotId: number,
  ) {
    return this.slots.changeSlot(owner.id, id, slotId, 'release');
  }

  @Post(':id/slots/:slotId/walk-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'A car parked without the app: mark the free slot occupied for its plate and start the clock.',
  })
  startWalkIn(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Param('slotId', ParseIdPipe) slotId: number,
    @Body() dto: StartWalkInDto,
  ) {
    return this.slots.startWalkIn(owner.id, id, slotId, dto.plate);
  }

  @Post(':id/walk-ins/:bookingId/end')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'The walk-in left: charge every started hour, record cash or card, free the slot.',
  })
  endWalkIn(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Param('bookingId', ParseIdPipe) bookingId: number,
    @Body() dto: EndWalkInDto,
  ) {
    return this.slots.endWalkIn(owner.id, id, bookingId, dto.payment_method);
  }

  @Post(':id/walk-ins/:bookingId/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove a walk-in entered by mistake, without a charge.',
  })
  removeWalkIn(
    @CurrentUser() owner: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Param('bookingId', ParseIdPipe) bookingId: number,
  ) {
    return this.slots.removeWalkIn(owner.id, id, bookingId);
  }
}
