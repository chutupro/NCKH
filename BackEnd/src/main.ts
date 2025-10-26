import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { log } from 'console';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // --- Listen server ---
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  log(`🚀 Server running: http://localhost:${port}/api`);
}
bootstrap();
