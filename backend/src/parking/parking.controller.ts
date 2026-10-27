import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import {
  PermissionsGuard,
  RequirePermissions,
} from 'src/auth/guards/permissions.guard';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { PERMISSIONS } from 'src/auth/permissions';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';
import { ParkingService } from 'src/parking/parking.service';
import {
  CreateParkingLotDto,
  CreateParkingSlotDto,
  CreateParkingSlotsDto,
  NearbyQueryDto,
  SearchQueryDto,
  SlotsQueryDto,
  UpdateParkingLotDto,
} from 'src/parking/dtos';

/**
 * Reading lots needs a signed-in user. Creating, editing and removing lots and
 * slots needs an admin (admin.access, checked against the database on every
 * request). Garage owners get their own routes with the Garage Portal.
 */
@ApiTags('Parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  // ------------------------------------------------------------- for the app
  // ('nearby', 'search' and 'favorites' must stay above ':id', or ':id' would catch them.)

  @Get('nearby')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  findNearby(@Query() query: NearbyQueryDto) {
    return this.parkingService.findNearby(query);
  }

  @Get('search')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  search(@Query() query: SearchQueryDto) {
    return this.parkingService.search(query);
  }

  /** The lots the user saved with the heart. */
  @Get('favorites')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  getFavorites(@CurrentUser() user: AuthenticatedUser) {
    return this.parkingService.getFavorites(user.id);
  }

  @Get(':id')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  getLot(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.parkingService.getLotDetails(id, user.id);
  }

  /** PUT and DELETE, so tapping the heart twice in a row is harmless. */
  @Put(':id/favorite')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  addFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.parkingService.addFavorite(user.id, id);
  }

  @Delete(':id/favorite')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  removeFavorite(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
  ) {
    return this.parkingService.removeFavorite(user.id, id);
  }

  @Get(':id/slots')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  getSlots(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: SlotsQueryDto,
  ) {
    return this.parkingService.getSlots(id, query);
  }

  // -------------------------------------------------------------- management

  @Post()
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  createLot(@Body() dto: CreateParkingLotDto) {
    return this.parkingService.createLot(dto);
  }

  @Patch(':id')
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  updateLot(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateParkingLotDto,
  ) {
    return this.parkingService.updateLot(id, dto);
  }

  @Delete(':id')
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  deleteLot(@Param('id', ParseIdPipe) id: number) {
    return this.parkingService.deleteLot(id);
  }

  @Post(':id/slots')
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  createSlots(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: CreateParkingSlotsDto,
  ) {
    return this.parkingService.createSlots(id, dto);
  }

  @Post(':id/slots/single')
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  addSlot(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: CreateParkingSlotDto,
  ) {
    return this.parkingService.addSlot(id, dto);
  }

  @Delete('slots/:slotId')
  @UseGuards(UserAccessTokenAuthGuard, PermissionsGuard)
  @RequirePermissions([PERMISSIONS.ADMIN_ACCESS])
  @ApiBearerAuth()
  deleteSlot(@Param('slotId', ParseIdPipe) slotId: number) {
    return this.parkingService.deleteSlot(slotId);
  }
}
