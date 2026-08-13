import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    useContainer(app.select(AppModule), {
        fallbackOnErrors: true,
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('ParkEasy API')
        .setDescription('ParkEasy API documentation')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);

    await app.listen(
        process.env.PORT ?? 3000,
    );
}

bootstrap();