import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhotoAnnotation } from '../entities/photo-annotation.entity';
import { CreateAnnotationDto } from '../models/dtos/create-annotation.dto';

/**
 * Photo annotations service
 */
@Injectable()
export class PhotoAnnotationsService {
  constructor(
    @InjectRepository(PhotoAnnotation)
    private readonly annotationRepository: Repository<PhotoAnnotation>,
  ) {}

  /**
   * Creates photo annotation
   */
  async createAnnotation({
    userId,
    createAnnotationDto,
  }: {
    userId: number;
    createAnnotationDto: CreateAnnotationDto;
  }) {
    const annotation = this.annotationRepository.create({
      ...createAnnotationDto,
      userId,
      isApproved: false,
    });
    return this.annotationRepository.save(annotation);
  }

  /**
   * Gets annotations for image
   */
  async getAnnotationsByImageId({ imageId }: { imageId: number }) {
    return this.annotationRepository.find({
      where: { imageId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Approves annotation
   */
  async approveAnnotation({ annotationId }: { annotationId: number }) {
    const annotation = await this.annotationRepository.findOne({ where: { annotationId } });
    if (!annotation) {
      throw new NotFoundException('Annotation not found');
    }
    annotation.isApproved = true;
    return this.annotationRepository.save(annotation);
  }

  /**
   * Deletes annotation
   */
  async deleteAnnotation({ annotationId }: { annotationId: number }): Promise<void> {
    const result = await this.annotationRepository.delete(annotationId);
    if (!result.affected) {
      throw new NotFoundException('Annotation not found');
    }
  }
}

