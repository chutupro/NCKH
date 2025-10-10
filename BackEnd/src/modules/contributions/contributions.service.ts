import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(
    @InjectRepository(Contribution)
    private readonly contributionRepository: Repository<Contribution>,
  ) {}

  findAll() {
    return this.contributionRepository.find({ relations: ['article', 'user', 'moderationLogs'] });
  }

  findOne(id: number) {
    return this.contributionRepository.findOne({
      where: { ContributionID: id },
      relations: ['article', 'user', 'moderationLogs'],
    });
  }

  create(contributionData: CreateContributionDto) {
    const contribution = this.contributionRepository.create(contributionData);
    contribution.SubmittedAt = new Date();
    return this.contributionRepository.save(contribution);
  }

  async update(id: number, contributionData: UpdateContributionDto) {
    contributionData.SubmittedAt = new Date();
    await this.contributionRepository.update(id, contributionData);
    return this.contributionRepository.findOneBy({ ContributionID: id });
  }

  async delete(id: number) {
    const contribution = await this.contributionRepository.findOneBy({ ContributionID: id });
    await this.contributionRepository.delete(id);
    return contribution;
  }
}