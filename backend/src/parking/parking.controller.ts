import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ParkingService } from './parking.service';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';

import {
  CreateParkingLotDto,
  CreateParkingSlotDto,
  CreateParkingSlotsDto,
  UpdateParkingLotDto
} from './dtos'

@ApiTags('Parking')
@UsePipes(ValidationPipe)
@UseGuards(UserAccessTokenAuthGuard)
@Controller('parking')
export class ParkingController {
  constructor(
    private readonly parkingService: ParkingService,
  ) { }

  @Post('lot')
  async createLot(
    @Body() dto: CreateParkingLotDto,
  ) {
    return this.parkingService.createLot(dto);
  }

  @Patch(':id/lot')
  async updateLot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParkingLotDto,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.updateLot(id, dto, lang);
  }

  @Delete(':id/lot')
  async deleteLot(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.deleteLot(id, lang);
  }

  @Post(':id/slots')
  async createSlots(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateParkingSlotsDto,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.createSlots(id, dto, lang);
  }

  @Post(':id/slots/single')
  async addSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateParkingSlotDto,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.addSlot(id, dto, lang);
  }

  @Delete('slots/:slotId')
  async deleteSlot(
    @Param('slotId', ParseIntPipe) slotId: number,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.deleteSlot(slotId, lang);
  }

  @Get('nearby')
  async getNearby(
    @Query('lat', ParseFloatPipe) lat: number,
    @Query('lng', ParseFloatPipe) lng: number,
    @Query(
      'radius',
      new DefaultValuePipe(5),
      ParseFloatPipe,
    )
    radius: number,
    @Query(
      'page',
      new DefaultValuePipe(1),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      ParseIntPipe,
    )
    pageSize: number,
  ) {
    return this.parkingService.findNearby(
      lat,
      lng,
      radius,
      page,
      pageSize,
    );
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query(
      'page',
      new DefaultValuePipe(1),
      ParseIntPipe,
    )
    page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      ParseIntPipe,
    )
    pageSize: number,
  ) {
    return this.parkingService.search(
      query,
      page,
      pageSize,
    );
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-lang') lang: string,
  ) {
    return this.parkingService.findById(id, lang);
  }

  @Get(':id/slots')
  async getSlots(
    @Param('id', ParseIntPipe) id: number,
    @Query('level') level?: string,
  ) {
    return this.parkingService.getSlots(id, level);
  }
}