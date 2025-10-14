import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { runSeeds } from './seeds';

/**
 * Script to seed database
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const connection = app.get(DataSource);
  
  try {
    await runSeeds(connection);
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
