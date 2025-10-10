import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VersionHistoryService } from './VersionHistory.service';
import { VersionHistoryController } from './VersionHistory.controller';
import { VersionHistory } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([VersionHistory])],
  controllers: [VersionHistoryController],
  providers: [VersionHistoryService],
  exports: [VersionHistoryService],
})
export class VersionHistoryModule {}