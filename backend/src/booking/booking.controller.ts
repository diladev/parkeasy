import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BookingService } from 'src/booking/booking.service';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import { ExtendBookingDto } from 'src/booking/dto';

@ApiTags('Booking')
@UsePipes(ValidationPipe)
@UseGuards(UserAccessTokenAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(
    private readonly bookingService: BookingService,
  ) { }

  @Get()
  async getMyBookings(
    @Req() req: any,
    @Query('status') status?: string,
    @Query(
      'page',
      new DefaultValuePipe(1),
      ParseIntPipe,
    )
    page?: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      ParseIntPipe,
    )
    pageSize?: number,
  ) {
    return this.bookingService.getUserBookings(
      req.user.id,
      status,
      page,
      pageSize,
    );
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-lang') lang: string,
  ) {
    return this.bookingService.findById(id, lang);
  }

  @Patch(':id/extend')
  async extend(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ExtendBookingDto,
    @Headers('x-lang') lang: string,
  ) {
    return this.bookingService.extendBooking(
      req.user.id,
      id,
      dto,
      lang,
    );
  }

  @Delete(':id')
  async cancel(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-lang') lang: string,
  ) {
    return this.bookingService.cancelBooking(
      req.user.id,
      id,
      lang,
    );
  }
}
