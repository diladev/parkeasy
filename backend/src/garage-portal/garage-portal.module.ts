import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { ParkingModule } from 'src/parking/parking.module';
import { UsersModule } from 'src/users/users.module';
import { GaragePortalController } from './garage-portal.controller';
import { GaragePortalService } from './garage-portal.service';

@Module({
  imports: [
    SequelizeModule.forFeature([ParkingLot]),
    // GarageStatsService: the same figures as the Admin Panel's garage page.
    ParkingModule,
    // PermissionsGuard reads the owner's role through UsersService.
    UsersModule,
  ],
  controllers: [GaragePortalController],
  providers: [GaragePortalService],
})
export class GaragePortalModule {}
