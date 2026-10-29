import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Session } from './entities/session.entity';
import { Vehicle } from './entities/vehicle.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Vehicle, Session])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
