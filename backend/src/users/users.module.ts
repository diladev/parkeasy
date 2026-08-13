import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TranslationService } from 'src/i18n/translation.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/entities/user.entity';
import { Vehicle } from 'src/users/entities/vehicle.entity';

@Module({
  imports: [SequelizeModule.forFeature([User, Vehicle])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
