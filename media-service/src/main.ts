import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Cho phép TẤT CẢ origins (chỉ dùng development)
  app.enableCors({
    origin: true, // Cho phép tất cả origins
    methods: 'GET,POST,DELETE,PUT,PATCH',
    credentials: true,
  });

  // Serve static files từ /storage
  app.use('/storage', express.static(path.join(__dirname, '..', 'storage')));
  
  // Serve test HTML page
  app.use(express.static(path.join(__dirname, '..')));

  // Start server
  await app.listen(3001);
  
  console.log('🚀 Media Service running on: http://localhost:3001');
  console.log('📁 Storage path:', path.join(__dirname, '..', 'storage'));
  console.log('');
  console.log('📋 Endpoints:');
  console.log('   POST /upload - Upload ảnh/video');
  console.log('   GET  /storage/* - Serve files');
}

bootstrap();
