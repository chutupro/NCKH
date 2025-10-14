import { Module } from '@nestjs/common';
import { HomeService } from './services/home.service';
import { HomeController } from './controllers/home.controller';
import { ArticlesModule } from '../articles/articles.module';
import { ImagesModule } from '../images/images.module';
import { TimelinesModule } from '../timelines/timelines.module';

/**
 * Home module
 */
@Module({
  imports: [ArticlesModule, ImagesModule, TimelinesModule],
  providers: [HomeService],
  controllers: [HomeController],
  exports: [HomeService],
})
export class HomeModule {}

