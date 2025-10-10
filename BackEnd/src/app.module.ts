import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseModule } from './common/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ModerationLogsModule } from './modules/moderation_logs/moderation_logs.module';

@Module({
  imports: [
    databaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ModerationLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
