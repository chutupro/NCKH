import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModerationLogsService } from './moderation_logs.service';
import { ModerationLogsController } from './moderation_logs.controller'; 
import { ModerationLog } from '../entities'; 
import { Contribution } from '../entities'; 
import { User } from '../entities'; 

@Module({
  imports: [TypeOrmModule.forFeature([ModerationLog, Contribution, User])],
  controllers: [ModerationLogsController],
  providers: [ModerationLogsService],
})
export class ModerationLogsModule {}