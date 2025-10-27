import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- Cấu hình CORS ---
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Cho phép FE truy cập
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // --- Cấu hình Swagger ---
  const config = new DocumentBuilder()
    .setTitle('API Example')                 // tiêu đề API
    .setDescription('API description')       // mô tả
    .setVersion('1.0')                       // version
    // 👇 thêm phần Bearer Auth để có nút "Authorize"
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Nhập token theo dạng: Bearer <access_token>',
        in: 'header',
      },
      'access-token', // 👈 tên scheme — sẽ dùng trong @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // --- Serve static files from uploads ---
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // --- Listen server ---
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  log(`🚀 Server running: http://localhost:${port}/api`);
}
bootstrap();