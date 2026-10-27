import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import { I18nValidationExceptionFilter, I18nValidationPipe } from 'nestjs-i18n';

import { AppModule } from './app.module';

/**
 * Everything the app needs around its modules: cookies, CORS, validation and
 * translated validation errors. Shared by main.ts and the e2e tests, so the
 * tests exercise the same request pipeline as the real server.
 */
export function configureApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService);
  const isProduction = config.get<string>('NODE_ENV') === 'production';

  // Lets class-validator constraints be resolved through Nest's DI container.
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Behind a reverse proxy (nginx), trust its X-Forwarded-For so rate limits
  // see the real client IP. TRUST_PROXY is the number of proxies in front.
  const trustProxy = Number(config.get<string>('TRUST_PROXY') ?? 0);
  if (trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  }

  // Parses the `refreshToken` cookie that web clients send to /user/local/refresh.
  app.use(cookieParser());

  // The web portals run on another origin. The mobile app is not affected by CORS.
  const corsOrigins = config.get<string>('CORS_ORIGINS');
  app.enableCors({
    origin: corsOrigins
      ? corsOrigins.split(',').map((origin) => origin.trim())
      : !isProduction,
    credentials: true,
  });

  // Validates every request DTO and translates the error messages into the
  // request language (resolved by I18nModule from x-lang or Accept-Language).
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({ detailedErrors: false }),
  );
}
