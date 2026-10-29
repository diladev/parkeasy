import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { getConnectionToken } from '@nestjs/sequelize';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { Sequelize } from 'sequelize-typescript';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { SUPPORTED_LANGUAGES } from './config/languages';
import { migrate } from './database/migrator';

async function bootstrap() {
  // rawBody: the payment webhook checks its signature against the exact bytes sent.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  configureApp(app);
  const config = app.get(ConfigService);

  app.enableShutdownHooks();

  // Bring the database up to date before taking requests. Nothing else reads
  // it this early: the background sweeps first run a minute after start.
  if (config.get<string>('DB_MIGRATE_ON_START', 'true') !== 'false') {
    await migrate(app.get<Sequelize>(getConnectionToken()));
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ParkEasy API')
    .setDescription('ParkEasy API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addGlobalParameters({
      name: 'x-lang',
      in: 'header',
      required: false,
      schema: { type: 'string', enum: [...SUPPORTED_LANGUAGES], default: 'en' },
    })
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = Number(config.get('PORT') ?? config.get('APP_PORT') ?? 3001);
  await app.listen(port);
  Logger.log(`ParkEasy API is running on port ${port}`, 'Bootstrap');
}

void bootstrap();
