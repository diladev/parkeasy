import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AuthModule } from 'src/auth/auth.module';
import { Booking } from 'src/booking/entities/booking.entity';
import { ParkingLot } from 'src/parking/entities/parking-lot.entity';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';
import { UsersModule } from 'src/users/users.module';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletTransaction } from 'src/wallet/entities/wallet-transaction.entity';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

/**
 * The Admin Panel's Users pages. A module of its own because it reads across
 * users, bookings and wallets, and sends reset codes through AuthService
 * (which itself depends on UsersModule).
 */
@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Vehicle,
      Booking,
      Wallet,
      WalletTransaction,
      ParkingLot,
    ]),
    // PermissionsGuard reads the admin's role through UsersService.
    UsersModule,
    AuthModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
