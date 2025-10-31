import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { TimelineModule } from './modules/timelines/timeline.module';
import { MapLocationsModule } from './modules/maplocations/map-locations.module';
import { register } from 'module';
import { AuthModule } from './modules/modules/auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    TimelineModule,
    MapLocationsModule,
    AuthModule
  ],
})
export class AppModule {}
