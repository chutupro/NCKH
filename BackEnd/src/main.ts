import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/exception_filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

    const config = new DocumentBuilder()
    .setTitle('Hệ thống Quản lý Nhân viên (QLNV)')
    .setDescription('API documentation cho hệ thống ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập JWT token sau khi login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('test', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
