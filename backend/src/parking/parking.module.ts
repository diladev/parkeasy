import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import { UsersModule } from 'src/users/users.module';
import { AdminGaragesController } from './admin-garages.controller';
import { AdminGaragesService } from './admin-garages.service';
import { GarageStatsService } from './garage-stats.service';
import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { ParkingLot } from './entities/parking-lot.entity';
import { ParkingSlot } from './entities/parking-slot.entity';
import { FavoriteLot } from './entities/favorite-lot.entity';

@Module({
  imports: [
    // Booking is read for the admin list's 30-day revenue.
    SequelizeModule.forFeature([ParkingLot, ParkingSlot, FavoriteLot, Booking]),
    // PermissionsGuard (admin routes) reads the user's role through UsersService.
    UsersModule,
  ],
  controllers: [ParkingController, AdminGaragesController],
  providers: [ParkingService, AdminGaragesService, GarageStatsService],
  exports: [ParkingService, GarageStatsService],
})
export class ParkingModule {}
