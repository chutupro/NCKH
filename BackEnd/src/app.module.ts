// src/app.module.ts
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DatabaseModule } from './common/database.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { MapLocationsModule } from './modules/maplocations/map-locations.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/modules/auth/auth.module';
import { ArticleModule } from './modules/articles_Post/article-post.module';
import { CommentModule } from './modules/comments/comment.module';
import { GalleryModule } from './gallerys/gallery.module';
import { UploadModule } from './modules/upload/upload.module';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { AdminModule } from './modules/modules/admin/admin.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { ImageComparisonsModule } from './modules/image-comparisons/image-comparisons.module';

@Module({
  imports: [
    // 👇 Cho phép truy cập file ảnh qua URL
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    DatabaseModule,
    TimelineModule,
    MapLocationsModule,
    AuthModule, // ✅ UNCOMMENT - Auth routes
    ArticleModule,
    CommentModule,
    GalleryModule,
    UploadModule, 
    CrawlerModule,
  CollectionsModule,
    ImageComparisonsModule,
    CategoriesModule,
    AdminModule, // ✅ ADMIN MODULE
  ],
})
export class AppModule {}
