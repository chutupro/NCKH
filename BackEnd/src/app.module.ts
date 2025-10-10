import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseModule } from './common/database.module';

@Module({
  imports: [databaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  
}
