import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationLog } from '../entities'; 
import { CreateModerationLogDto } from './dto/create-moderation_log.dto'; 
import { UpdateModerationLogDto } from './dto/update-moderation_log.dto'; 
import { Contribution } from '../entities'; 
import { User } from '../entities'; 

@Injectable()
export class ModerationLogsService {
  constructor(
    @InjectRepository(ModerationLog)
    private moderationLogRepo: Repository<ModerationLog>,

    @InjectRepository(Contribution)
    private contributionRepo: Repository<Contribution>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateModerationLogDto) {
    const contribution = await this.contributionRepo.findOne({
      where: { ContributionID: dto.ContributionID },
    });
    if (!contribution) throw new NotFoundException('Contribution not found');

    const moderator = await this.userRepo.findOne({
      where: { UserID: dto.ModeratorID },
    });
    if (!moderator) throw new NotFoundException('Moderator not found');

    const log = this.moderationLogRepo.create({
      contribution,
      moderator,
      Action: dto.Action,
      Reason: dto.Reason,
    });

    return await this.moderationLogRepo.save(log);
  }

  async findAll() {
    return await this.moderationLogRepo.find({
      relations: ['contribution', 'moderator'],
      order: { Timestamp: 'DESC' },
    });
  }

  async findOne(id: number) {
    const log = await this.moderationLogRepo.findOne({
      where: { LogID: id },
      relations: ['contribution', 'moderator'],
    });
    if (!log) throw new NotFoundException('Moderation log not found');
    return log;
  }

  async update(id: number, dto: UpdateModerationLogDto) {
    const log = await this.moderationLogRepo.findOne({ where: { LogID: id } });
    if (!log) throw new NotFoundException('Moderation log not found');

    Object.assign(log, dto);
    return await this.moderationLogRepo.save(log);
  }

  async remove(id: number) {
    const log = await this.moderationLogRepo.findOne({ where: { LogID: id } });
    if (!log) throw new NotFoundException('Moderation log not found');
    await this.moderationLogRepo.remove(log);
    return { message: 'Deleted successfully' };
  }
}