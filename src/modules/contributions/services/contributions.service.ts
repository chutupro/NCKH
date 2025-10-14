import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { CreateContributionDto } from '../models/dtos/create-contribution.dto';
import { ContributionResponseDto } from '../models/dtos/contribution-response.dto';

/**
 * Contributions service
 */
@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
  ) {}

  /**
   * Creates new contribution
   */
  async createContribution({
    userId,
    createContributionDto,
  }: {
    userId: number;
    createContributionDto: CreateContributionDto;
  }): Promise<ContributionResponseDto> {
    const contribution = this.contributionRepository.create({
      ...createContributionDto,
      userId,
      status: 'Pending',
    });
    const savedContribution = await this.contributionRepository.save(contribution);
    return this.getContributionById({ contributionId: savedContribution.contributionId });
  }

  /**
   * Gets contribution by ID
   */
  async getContributionById({ contributionId }: { contributionId: number }): Promise<ContributionResponseDto> {
    const contribution = await this.contributionRepository.findOne({
      where: { contributionId },
      relations: ['user'],
    });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    return this.mapToResponseDto(contribution);
  }

  /**
   * Gets all contributions
   */
  async getAllContributions(): Promise<ContributionResponseDto[]> {
    const contributions = await this.contributionRepository.find({
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });
    return contributions.map((contribution) => this.mapToResponseDto(contribution));
  }

  /**
   * Gets contributions by user
   */
  async getContributionsByUser({ userId }: { userId: number }): Promise<ContributionResponseDto[]> {
    const contributions = await this.contributionRepository.find({
      where: { userId },
      relations: ['user'],
      order: { submittedAt: 'DESC' },
    });
    return contributions.map((contribution) => this.mapToResponseDto(contribution));
  }

  /**
   * Gets pending contributions
   */
  async getPendingContributions(): Promise<ContributionResponseDto[]> {
    const contributions = await this.contributionRepository.find({
      where: { status: 'Pending' },
      relations: ['user'],
      order: { submittedAt: 'ASC' },
    });
    return contributions.map((contribution) => this.mapToResponseDto(contribution));
  }

  /**
   * Updates contribution status
   */
  async updateContributionStatus({
    contributionId,
    status,
  }: {
    contributionId: number;
    status: string;
  }): Promise<void> {
    const contribution = await this.contributionRepository.findOne({ where: { contributionId } });
    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }
    contribution.status = status;
    await this.contributionRepository.save(contribution);
  }

  /**
   * Maps contribution entity to response DTO
   */
  private mapToResponseDto(contribution: Contribution): ContributionResponseDto {
    return {
      contributionId: contribution.contributionId,
      articleId: contribution.articleId,
      userId: contribution.userId,
      content: contribution.content,
      status: contribution.status,
      submittedAt: contribution.submittedAt,
      authorName: contribution.user.fullName,
    };
  }
}

