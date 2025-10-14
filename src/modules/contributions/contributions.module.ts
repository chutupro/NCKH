import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContributionsService } from './services/contributions.service';
import { ModerationService } from './services/moderation.service';
import { ContributionsController } from './controllers/contributions.controller';
import { ModerationController } from './controllers/moderation.controller';
import { Contribution } from './entities/contribution.entity';
import { ModerationLog } from './entities/moderation-log.entity';

/**
 * Contributions module
 */
@Module({
  imports: [TypeOrmModule.forFeature([Contribution, ModerationLog])],
  providers: [ContributionsService, ModerationService],
  controllers: [ContributionsController, ModerationController],
  exports: [ContributionsService, ModerationService],
})
export class ContributionsModule {}

