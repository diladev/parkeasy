import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  AcceptLanguageResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { join } from 'path';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Vehicle } from './users/entities/vehicle.entity';
import { TranslationModule } from './i18n/translation.module';
import { ParkingModule } from './parking/parking.module';
import { ParkingLot } from './parking/entities/parking-lot.entity';
import { ParkingSlot } from './parking/entities/parking-slot.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    I18nModule.forRoot({
      fallbackLanguage: 'en',

      loaderOptions: {
        path: join(__dirname, 'i18n'),
        watch: true,
        includeSubfolders: true,
      },

      resolvers: [
        {
          use: QueryResolver,
          options: ['lang'],
        },
        new HeaderResolver(['x-lang']),
        AcceptLanguageResolver,
      ],
    }),

    TranslationModule,

    SequelizeModule.forRoot({
      dialect: process.env.DB_DIALECT as Dialect,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timezone: '+03:00',
      models: [User, Vehicle, ParkingLot, ParkingSlot],
      synchronize: true,
      autoLoadModels: true,
      logging: false,
    }),

    UsersModule,
    AuthModule,
    ParkingModule,
  ],

  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule { }