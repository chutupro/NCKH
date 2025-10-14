import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';

const DEFAULT_PORT = 3000;
const CORS_ORIGIN = true;
const MAX_JSON_LIMIT = '10mb';
const MAX_URLENCODED_LIMIT = '10mb';

/**
 * Bootstraps the NestJS application
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: CORS_ORIGIN,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Thêm các options sau để tăng cường bảo mật cho validator
      forbidUnknownValues: true,
      disableErrorMessages: configService.get<string>('NODE_ENV') === 'production',
      stopAtFirstError: true,
    }),
  );
  app.use((req: any, _res: any, next: () => void) => {
    req.setMaxListeners(0);
    next();
  });
  app.use(express.json({ limit: MAX_JSON_LIMIT }));
  app.use(express.urlencoded({ limit: MAX_URLENCODED_LIMIT, extended: true }));
  const config = new DocumentBuilder()
    .setTitle('Historical Archive API')
    .setDescription('NestJS API for historical content management system with articles, images, timelines, and map locations')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication and registration')
    .addTag('Users', 'User management')
    .addTag('Roles', 'Role management')
    .addTag('Articles', 'Article CRUD operations')
    .addTag('Analytics', 'View tracking and statistics')
    .addTag('Images', 'Image upload and management')
    .addTag('Image Comparisons', 'Historical vs modern image comparisons')
    .addTag('Contributions', 'User contributions to articles')
    .addTag('Moderation', 'Contribution moderation')
    .addTag('Feedback', 'Article feedback and ratings')
    .addTag('Timelines', 'Historical timeline events')
    .addTag('Map Locations', 'Geographic locations and events')
    .addTag('Dashboard', 'Admin dashboard and statistics')
    .addTag('Home', 'Home page aggregated data')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = configService.get<number>('PORT') || DEFAULT_PORT;
  await app.listen(port, '0.0.0.0', () => {
    console.log(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   🚀 Application is running on:                            ║
    ║                                                            ║
    ║   ➜ Local:            http://localhost:${port}/api/docs       ║
    ║   ➜ Network:          http://<your-ip>:${port}/api/docs    ║
    ║                                                            ║
    ║   📚 API Documentation is available at /api/docs          ║
    ║   🔐 Use Bearer token for authentication                  ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    `);
  });
}

bootstrap();

