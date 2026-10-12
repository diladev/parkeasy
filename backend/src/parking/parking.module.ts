import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ParkingService } from './parking.service';
import { ParkingController } from './parking.controller';
import { ParkingLot } from './entities/parking-lot.entity';
import { ParkingSlot } from './entities/parking-slot.entity';

@Module({
  imports: [SequelizeModule.forFeature([ParkingLot, ParkingSlot])],
  controllers: [ParkingController],
  providers: [ParkingService],
  exports: [ParkingService],
})
export class ParkingModule { }
