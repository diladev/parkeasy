import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';
import { Dialect } from 'sequelize';

import { validateEnvironment } from './config/env.validation';
import passwordPolicy from './config/password-policy';
import { defaultLanguage } from './config/languages';
import { TranslationModule } from './i18n/translation.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ParkingModule } from './parking/parking.module';
import { WalletModule } from './wallet/wallet.module';
import { BookingModule } from './booking/booking.module';
import { NotificationsModule } from './notifications/notifications.module';
import { User } from './users/entities/user.entity';
import { Vehicle } from './users/entities/vehicle.entity';
import { ParkingLot } from './parking/entities/parking-lot.entity';
import { ParkingSlot } from './parking/entities/parking-slot.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { WalletTransaction } from './wallet/entities/wallet-transaction.entity';
import { Booking } from './booking/entities/booking.entity';
import { Notification } from './notifications/entities/notification.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // backend/.env first, then the monorepo root .env (used by docker compose).
      envFilePath: ['.env', '../.env'],
      load: [passwordPolicy],
      validate: validateEnvironment,
    }),

    // The request language is resolved here, once, for the whole API:
    //   x-lang header  ->  Accept-Language header  ->  DEFAULT_LANGUAGE.
    // Services read it through TranslationService; nothing passes `lang` around.
    // (No ?lang= query resolver: query DTOs reject unknown query params.)
    // forRootAsync, so the settings are read after ConfigModule has loaded .env.
    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        fallbackLanguage: defaultLanguage(),
        fallbacks: { 'en-*': 'en', 'ckb-*': 'ckb' },
        loaderOptions: {
          path: join(__dirname, 'i18n'),
          watch: config.get<string>('NODE_ENV') !== 'production',
        },
      }),
      resolvers: [
        new HeaderResolver(['x-lang']),
        // 'loose' so a phone set to Kurdish (Iraq), which sends "ckb-IQ,en;q=0.8",
        // gets Kurdish. The default ('strict-loose') would pick the exact "en" first.
        new AcceptLanguageResolver({ matchType: 'loose' }),
      ],
    }),

    TranslationModule,

    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dialect = config.get<Dialect>('DB_DIALECT', 'mysql');
        return {
          dialect,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: Number(config.get('DB_PORT', 3306)),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          // SQLite (handy for local tests) has no timezone setting, only a file path.
          ...(dialect === 'sqlite'
            ? { storage: config.get<string>('DB_STORAGE', ':memory:') }
            : { timezone: '+03:00' }),
          models: [
            User,
            Vehicle,
            ParkingLot,
            ParkingSlot,
            Wallet,
            WalletTransaction,
            Booking,
            Notification,
          ],
          autoLoadModels: true,
          synchronize: true,
          logging: false,
        };
      },
    }),

    UsersModule,
    AuthModule,
    ParkingModule,
    WalletModule,
    BookingModule,
    NotificationsModule,
  ],
})
export class AppModule { }
