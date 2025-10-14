import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Timeline } from '../entities/timeline.entity';
import { CreateTimelineDto } from '../models/dtos/create-timeline.dto';
import { TimelineResponseDto } from '../models/dtos/timeline-response.dto';

/**
 * Timelines service
 */
@Injectable()
export class TimelinesService {
  constructor(
    @InjectRepository(Timeline)
    private readonly timelineRepository: Repository<Timeline>,
  ) {}

  /**
   * Creates new timeline
   */
  async createTimeline(createTimelineDto: CreateTimelineDto): Promise<TimelineResponseDto> {
    const timeline = this.timelineRepository.create({
      ...createTimelineDto,
      eventDate: new Date(createTimelineDto.eventDate),
    });
    const savedTimeline = await this.timelineRepository.save(timeline);
    return this.mapToResponseDto(savedTimeline);
  }

  /**
   * Gets timeline by ID
   */
  async getTimelineById({ timelineId }: { timelineId: number }): Promise<TimelineResponseDto> {
    const timeline = await this.timelineRepository.findOne({ where: { timelineId } });
    if (!timeline) {
      throw new NotFoundException('Timeline not found');
    }
    return this.mapToResponseDto(timeline);
  }

  /**
   * Gets timelines by article
   */
  async getTimelinesByArticle({ articleId }: { articleId: number }): Promise<TimelineResponseDto[]> {
    const timelines = await this.timelineRepository.find({
      where: { articleId },
      order: { eventDate: 'ASC' },
    });
    return timelines.map((timeline) => this.mapToResponseDto(timeline));
  }

  /**
   * Gets timelines by date range
   */
  async getTimelinesByDateRange({
    startDate,
    endDate,
  }: {
    startDate: Date;
    endDate: Date;
  }): Promise<TimelineResponseDto[]> {
    const timelines = await this.timelineRepository.find({
      where: {
        eventDate: Between(startDate, endDate),
      },
      order: { eventDate: 'ASC' },
    });
    return timelines.map((timeline) => this.mapToResponseDto(timeline));
  }

  /**
   * Gets all timelines
   */
  async getAllTimelines(): Promise<TimelineResponseDto[]> {
    const timelines = await this.timelineRepository.find({
      order: { eventDate: 'ASC' },
    });
    return timelines.map((timeline) => this.mapToResponseDto(timeline));
  }

  /**
   * Deletes timeline
   */
  async deleteTimeline({ timelineId }: { timelineId: number }): Promise<void> {
    const result = await this.timelineRepository.delete(timelineId);
    if (!result.affected) {
      throw new NotFoundException('Timeline not found');
    }
  }

  /**
   * Maps timeline entity to response DTO
   */
  private mapToResponseDto(timeline: Timeline): TimelineResponseDto {
    return {
      timelineId: timeline.timelineId,
      articleId: timeline.articleId,
      eventDate: timeline.eventDate,
      description: timeline.description,
      latitude: timeline.latitude,
      longitude: timeline.longitude,
    };
  }
}

