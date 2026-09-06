import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { ParkingModule } from 'src/parking/parking.module';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Booking]),
    ParkingModule,
    WalletModule
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
