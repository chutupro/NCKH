import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VersionHistory } from '../entities/version-history.entity';

/**
 * Version history service
 */
@Injectable()
export class VersionHistoryService {
  constructor(
    @InjectRepository(VersionHistory)
    private readonly versionHistoryRepository: Repository<VersionHistory>,
  ) {}

  /**
   * Creates version history record
   */
  async createVersion({
    articleId,
    userId,
    content,
  }: {
    articleId: number;
    userId: number;
    content: string;
  }): Promise<void> {
    const version = this.versionHistoryRepository.create({
      articleId,
      userId,
      content,
    });
    await this.versionHistoryRepository.save(version);
  }

  /**
   * Gets version history for article
   */
  async getArticleVersions({ articleId }: { articleId: number }) {
    return this.versionHistoryRepository.find({
      where: { articleId },
      relations: ['user'],
      order: { modifiedAt: 'DESC' },
    });
  }

  /**
   * Gets specific version by ID
   */
  async getVersionById({ versionId }: { versionId: number }) {
    return this.versionHistoryRepository.findOne({
      where: { versionId },
      relations: ['user', 'article'],
    });
  }
}

