
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from '../entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  findAll() {
    return this.analyticsRepository.find({ relations: ['article'] });
  }

  findOne(id: number) {
    return this.analyticsRepository.findOne({
      where: { AnalyticsID: id },
      relations: ['article'],
    });
  }

  create(analyticsData: CreateAnalyticsDto) {
    const analytics = this.analyticsRepository.create(analyticsData);
    analytics.CreatedAt = new Date();
    analytics.UpdatedAt = new Date();
    return this.analyticsRepository.save(analytics);
  }

  async update(id: number, analyticsData: UpdateAnalyticsDto) {
    analyticsData.UpdatedAt = new Date();
    await this.analyticsRepository.update(id, analyticsData);
    return this.analyticsRepository.findOneBy({ AnalyticsID: id });
  }

  async delete(id: number) {
    const analytics = await this.analyticsRepository.findOneBy({ AnalyticsID: id });
    await this.analyticsRepository.delete(id);
    return analytics;
  }

  async incrementViewCount(id: number) {
    const analytics = await this.findOne(id);
    if (!analytics) {
      throw new Error('Analytics không tìm thấy');
    }
    analytics.ViewCount += 1;
    analytics.UpdatedAt = new Date();
    return this.analyticsRepository.save(analytics);
  }
}

