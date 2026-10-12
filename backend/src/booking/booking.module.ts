import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { NotificationsModule } from 'src/notifications/notifications.module';
import { ParkingModule } from 'src/parking/parking.module';
import { UsersModule } from 'src/users/users.module';
import { WalletModule } from 'src/wallet/wallet.module';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Booking]),
    ParkingModule,
    WalletModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule { }
