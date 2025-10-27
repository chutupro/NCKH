import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { ArticleModule } from './modules/articles/article.module';
import { TimelineModule } from './modules/timelines/timeline.module';
<<<<<<< Updated upstream
import { CompareModule } from './modules/Compare/Compare.module'; 
import { UserModule } from './modules/modules/user/user.module';
import { AuthModule } from './modules/modules/auth/auth.module';
=======
import { MapLocationsModule } from './modules/maplocations/map-locations.module';
>>>>>>> Stashed changes

@Module({
  imports: [
    DatabaseModule,
    ArticleModule,
    TimelineModule,
<<<<<<< Updated upstream
    CompareModule, 
    AuthModule,
    UserModule,
=======
    MapLocationsModule
>>>>>>> Stashed changes
  ],
})
export class AppModule {}
