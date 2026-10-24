import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserAccessTokenAuthGuard } from 'src/auth/guards/user-access-token.guard';
import type { AuthenticatedUser } from 'src/auth/types/auth.types';
import { BookingService } from 'src/booking/booking.service';
import { BookingQueryDto, CreateBookingDto, ExtendBookingDto } from 'src/booking/dto';
import { ParseIdPipe } from 'src/common/pipes/parse-id.pipe';

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(UserAccessTokenAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(user.id, dto);
  }

  @Get()
  getMyBookings(@CurrentUser() user: AuthenticatedUser, @Query() query: BookingQueryDto) {
    return this.bookingService.getUserBookings(user.id, query);
  }

  @Get(':id')
  getOne(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
    return this.bookingService.findUserBooking(user.id, id);
  }

  /** What the booking cost: what was charged and refunded, from the wallet's records. */
  @Get(':id/receipt')
  getReceipt(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
    return this.bookingService.getReceipt(user.id, id);
  }

  @Patch(':id/extend')
  extend(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: ExtendBookingDto,
  ) {
    return this.bookingService.extendBooking(user.id, id, dto);
  }

  /**
   * Cancels with a full refund, during the lot's free cancellation window only.
   * A PATCH, not a DELETE: nothing is deleted, the booking stays in the history.
   */
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
    return this.bookingService.cancelBooking(user.id, id);
  }

  /** Ends the parking now and frees the slot. Nothing is refunded. */
  @Patch(':id/end')
  end(@CurrentUser() user: AuthenticatedUser, @Param('id', ParseIdPipe) id: number) {
    return this.bookingService.endBooking(user.id, id);
  }
}
