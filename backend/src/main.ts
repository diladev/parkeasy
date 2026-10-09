import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import {
    I18nValidationExceptionFilter,
    I18nValidationPipe,
} from 'nestjs-i18n';

import { AppModule } from './app.module';
import { SUPPORTED_LANGUAGES } from './config/languages';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    // Lets class-validator constraints be resolved through Nest's DI container.
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

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

    app.enableShutdownHooks();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('ParkEasy API')
        .setDescription('ParkEasy API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .addApiKey({ type: 'apiKey', in: 'header', name: 'x-admin-key' }, 'admin-key')
        .addGlobalParameters({
            name: 'x-lang',
            in: 'header',
            required: false,
            schema: { type: 'string', enum: [...SUPPORTED_LANGUAGES], default: 'en' },
        })
        .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

    const port = Number(config.get('PORT') ?? config.get('APP_PORT') ?? 3001);
    await app.listen(port);
    Logger.log(`ParkEasy API is running on port ${port}`, 'Bootstrap');
}

void bootstrap();
