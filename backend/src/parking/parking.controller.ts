import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';

import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { AdminApiKeyGuard } from 'src/common/guards/admin-api-key.guard';
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
 * slots needs the `x-admin-key` header (ADMIN_API_KEY in .env) until the
 * garage-owner portal has its own login.
 */
@ApiTags('Parking')
@Controller('parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) { }

  // ------------------------------------------------------------- for the app
  // ('nearby' and 'search' must stay above ':id', or ':id' would catch them.)

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

  @Get(':id')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  getLot(@Param('id', ParseIdPipe) id: number) {
    return this.parkingService.getLotDetails(id);
  }

  @Get(':id/slots')
  @UseGuards(UserAccessTokenAuthGuard)
  @ApiBearerAuth()
  getSlots(@Param('id', ParseIdPipe) id: number, @Query() query: SlotsQueryDto) {
    return this.parkingService.getSlots(id, query);
  }

  // -------------------------------------------------------------- management

  @Post()
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  createLot(@Body() dto: CreateParkingLotDto) {
    return this.parkingService.createLot(dto);
  }

  @Patch(':id')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  updateLot(@Param('id', ParseIdPipe) id: number, @Body() dto: UpdateParkingLotDto) {
    return this.parkingService.updateLot(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  deleteLot(@Param('id', ParseIdPipe) id: number) {
    return this.parkingService.deleteLot(id);
  }

  @Post(':id/slots')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  createSlots(@Param('id', ParseIdPipe) id: number, @Body() dto: CreateParkingSlotsDto) {
    return this.parkingService.createSlots(id, dto);
  }

  @Post(':id/slots/single')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  addSlot(@Param('id', ParseIdPipe) id: number, @Body() dto: CreateParkingSlotDto) {
    return this.parkingService.addSlot(id, dto);
  }

  @Delete('slots/:slotId')
  @UseGuards(AdminApiKeyGuard)
  @ApiSecurity('admin-key')
  deleteSlot(@Param('slotId', ParseIdPipe) slotId: number) {
    return this.parkingService.deleteSlot(slotId);
  }
}
