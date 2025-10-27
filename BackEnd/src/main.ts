import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Cấu hình Swagger ---
  const config = new DocumentBuilder()
<<<<<<< Updated upstream
    .setTitle('API Example')          // tiêu đề API
    .setDescription('API description') // mô tả
    .setVersion('1.0')                // version
=======
    .setTitle('API Example')
    .setDescription('API description')
    .setVersion('1.0')
>>>>>>> Stashed changes
    .build();
  const document = SwaggerModule.createDocument(app, config);
<<<<<<< Updated upstream
  SwaggerModule.setup('api', app, document); // Swagger UI tại /api
=======
  SwaggerModule.setup('api', app, document);

  // --- Serve static files from uploads ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
>>>>>>> Stashed changes

  // --- Listen server ---
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  log(`Server listening on http://localhost:${port}/api`);
}
bootstrap();
