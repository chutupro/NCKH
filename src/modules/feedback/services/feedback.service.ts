import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../entities/feedback.entity';
import { CreateFeedbackDto } from '../models/dtos/create-feedback.dto';
import { FeedbackResponseDto } from '../models/dtos/feedback-response.dto';

const MIN_RATING = 0;
const MAX_RATING = 5;

/**
 * Feedback service
 */
@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
  ) {}

  /**
   * Creates new feedback
   */
  async createFeedback({
    userId,
    createFeedbackDto,
  }: {
    userId: number;
    createFeedbackDto: CreateFeedbackDto;
  }): Promise<FeedbackResponseDto> {
    if (createFeedbackDto.rating !== undefined) {
      this.validateRating(createFeedbackDto.rating);
    }
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      userId,
    });
    const savedFeedback = await this.feedbackRepository.save(feedback);
    return this.getFeedbackById({ feedbackId: savedFeedback.feedbackId });
  }

  /**
   * Gets feedback by ID
   */
  async getFeedbackById({ feedbackId }: { feedbackId: number }): Promise<FeedbackResponseDto> {
    const feedback = await this.feedbackRepository.findOne({
      where: { feedbackId },
      relations: ['user'],
    });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    return this.mapToResponseDto(feedback);
  }

  /**
   * Gets feedback for article
   */
  async getFeedbackByArticle({ articleId }: { articleId: number }): Promise<FeedbackResponseDto[]> {
    const feedbacks = await this.feedbackRepository.find({
      where: { articleId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
    return feedbacks.map((feedback) => this.mapToResponseDto(feedback));
  }

  /**
   * Deletes feedback
   */
  async deleteFeedback({ feedbackId, userId }: { feedbackId: number; userId: number }): Promise<void> {
    const feedback = await this.feedbackRepository.findOne({ where: { feedbackId } });
    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }
    if (feedback.userId !== userId) {
      throw new BadRequestException('You can only delete your own feedback');
    }
    await this.feedbackRepository.delete(feedbackId);
  }

  /**
   * Validates rating value
   */
  private validateRating(rating: number): void {
    if (rating < MIN_RATING || rating > MAX_RATING) {
      throw new BadRequestException(`Rating must be between ${MIN_RATING} and ${MAX_RATING}`);
    }
  }

  /**
   * Maps feedback entity to response DTO
   */
  private mapToResponseDto(feedback: Feedback): FeedbackResponseDto {
    return {
      feedbackId: feedback.feedbackId,
      articleId: feedback.articleId,
      userId: feedback.userId,
      comment: feedback.comment,
      rating: feedback.rating,
      createdAt: feedback.createdAt,
      authorName: feedback.user.fullName,
    };
  }
}

