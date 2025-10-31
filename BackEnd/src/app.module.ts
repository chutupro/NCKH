// src/app.module.ts
import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { DatabaseModule } from './common/database.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { MapLocationsModule } from './modules/maplocations/map-locations.module';
import { AuthModule } from './modules/modules/auth/auth.module';

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
    AuthModule
  ],
})
export class AppModule {}
