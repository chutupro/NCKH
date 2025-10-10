import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  findAll() {
    return this.feedbackRepository.find({ relations: ['article', 'user'] });
  }

  findOne(id: number) {
    return this.feedbackRepository.findOne({
      where: { FeedbackID: id },
      relations: ['article', 'user'],
    });
  }

  create(feedbackData: Partial<Feedback>) {
    if (
      feedbackData.Rating &&
      (feedbackData.Rating < 0 || feedbackData.Rating > 5)
    ) {
      throw new BadRequestException('Rating phải từ 0 đến 5');
    }
    const feedback = this.feedbackRepository.create(feedbackData);
    feedback.CreatedAt = new Date();
    return this.feedbackRepository.save(feedback);
  }

  async update(id: number, feedbackData: Partial<Feedback>) {
    if (
      feedbackData.Rating &&
      (feedbackData.Rating < 0 || feedbackData.Rating > 5)
    ) {
      throw new BadRequestException('Rating phải từ 0 đến 5');
    }
    feedbackData.CreatedAt = new Date();
    await this.feedbackRepository.update(id, feedbackData);
    return this.feedbackRepository.findOneBy({ FeedbackID: id });
  }

  async delete(id: number) {
    const feedback = await this.feedbackRepository.findOneBy({
      FeedbackID: id,
    });
    await this.feedbackRepository.delete(id);
    return feedback;
  }
}
