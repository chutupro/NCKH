import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ModerationLog } from '../entities/moderation-log.entity';
import { ContributionsService } from './contributions.service';
import { ModerateContributionDto } from '../models/dtos/moderate-contribution.dto';
import { ModerationLogResponseDto } from '../models/dtos/moderation-log-response.dto';

/**
 * Moderation service
 */
@Injectable()
export class ModerationService {
  constructor(
    @InjectRepository(ModerationLog)
    private readonly moderationLogRepository: Repository<ModerationLog>,
    private readonly contributionsService: ContributionsService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Moderates contribution with transaction
   */
  async moderateContribution({
    contributionId,
    moderatorId,
    moderateDto,
  }: {
    contributionId: number;
    moderatorId: number;
    moderateDto: ModerateContributionDto;
  }): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.contributionsService.updateContributionStatus({
        contributionId,
        status: moderateDto.action,
      });
      const log = manager.create(ModerationLog, {
        contributionId,
        moderatorId,
        action: moderateDto.action,
        reason: moderateDto.reason || null,
      });
      await manager.save(log);
    });
  }

  /**
   * Gets moderation logs
   */
  async getModerationLogs(): Promise<ModerationLogResponseDto[]> {
    const logs = await this.moderationLogRepository.find({
      relations: ['moderator'],
      order: { timestamp: 'DESC' },
    });
    return logs.map((log) => this.mapToResponseDto(log));
  }

  /**
   * Gets moderation logs for contribution
   */
  async getLogsByContribution({ contributionId }: { contributionId: number }): Promise<ModerationLogResponseDto[]> {
    const logs = await this.moderationLogRepository.find({
      where: { contributionId },
      relations: ['moderator'],
      order: { timestamp: 'DESC' },
    });
    return logs.map((log) => this.mapToResponseDto(log));
  }

  /**
   * Maps moderation log entity to response DTO
   */
  private mapToResponseDto(log: ModerationLog): ModerationLogResponseDto {
    return {
      logId: log.logId,
      contributionId: log.contributionId,
      moderatorId: log.moderatorId,
      action: log.action,
      reason: log.reason,
      timestamp: log.timestamp,
      moderatorName: log.moderator.fullName,
    };
  }
}

