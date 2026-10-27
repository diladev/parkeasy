import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Booking } from 'src/booking/entities/booking.entity';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';
import { AdminOverviewController } from './admin-overview.controller';
import { AdminOverviewService } from './admin-overview.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, ParkingLot, Booking]),
    // PermissionsGuard reads the admin's role through UsersService.
    UsersModule,
  ],
  controllers: [AdminOverviewController],
  providers: [AdminOverviewService],
})
export class AdminOverviewModule {}
