import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingSlot } from 'src/parking/entities/parking-slot.entity';
import { PriceOverride } from 'src/parking/entities/price-override.entity';
import { ParkingModule } from 'src/parking/parking.module';
import { UsersModule } from 'src/users/users.module';
import { GaragePortalController } from './garage-portal.controller';
import { GarageBookingsService } from './garage-bookings.service';
import { GaragePortalService } from './garage-portal.service';
import { GarageSettingsService } from './garage-settings.service';
import { GarageSlotsService } from './garage-slots.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      ParkingLot,
      ParkingSlot,
      PriceOverride,
      Booking,
    ]),
    // GarageStatsService: the same figures as the Admin Panel's garage page.
    ParkingModule,
    // PermissionsGuard reads the owner's role through UsersService.
    UsersModule,
  ],
  controllers: [GaragePortalController],
  providers: [
    GaragePortalService,
    GarageSlotsService,
    GarageBookingsService,
    GarageSettingsService,
  ],
})
export class GaragePortalModule {}
