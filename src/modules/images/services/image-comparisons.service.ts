import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImageComparison } from '../entities/image-comparison.entity';
import { CreateComparisonDto } from '../models/dtos/create-comparison.dto';
import { ComparisonResponseDto } from '../models/dtos/comparison-response.dto';

const FEATURED_COMPARISONS_LIMIT = 10;

/**
 * Image comparisons service
 */
@Injectable()
export class ImageComparisonsService {
  constructor(
    @InjectRepository(ImageComparison)
    private readonly comparisonRepository: Repository<ImageComparison>,
  ) {}

  /**
   * Creates image comparison
   */
  async createComparison(createComparisonDto: CreateComparisonDto): Promise<ComparisonResponseDto> {
    const comparison = this.comparisonRepository.create(createComparisonDto);
    const savedComparison = await this.comparisonRepository.save(comparison);
    return this.getComparisonById({ comparisonId: savedComparison.comparisonId });
  }

  /**
   * Gets comparison by ID
   */
  async getComparisonById({ comparisonId }: { comparisonId: number }): Promise<ComparisonResponseDto> {
    const comparison = await this.comparisonRepository.findOne({
      where: { comparisonId },
      relations: ['historicalImage', 'modernImage'],
    });
    if (!comparison) {
      throw new NotFoundException('Comparison not found');
    }
    return this.mapToResponseDto(comparison);
  }

  /**
   * Gets all comparisons
   */
  async getAllComparisons(): Promise<ComparisonResponseDto[]> {
    const comparisons = await this.comparisonRepository.find({
      relations: ['historicalImage', 'modernImage'],
    });
    return comparisons.map((comparison) => this.mapToResponseDto(comparison));
  }

  /**
   * Gets featured comparisons
   */
  async getFeaturedComparisons({ limit }: { limit?: number }): Promise<ComparisonResponseDto[]> {
    const featuredLimit = limit || FEATURED_COMPARISONS_LIMIT;
    const comparisons = await this.comparisonRepository.find({
      relations: ['historicalImage', 'modernImage'],
      take: featuredLimit,
    });
    return comparisons.map((comparison) => this.mapToResponseDto(comparison));
  }

  /**
   * Gets comparisons by article
   */
  async getComparisonsByArticle({ articleId }: { articleId: number }): Promise<ComparisonResponseDto[]> {
    const comparisons = await this.comparisonRepository.find({
      where: { articleId },
      relations: ['historicalImage', 'modernImage'],
    });
    return comparisons.map((comparison) => this.mapToResponseDto(comparison));
  }

  /**
   * Deletes comparison
   */
  async deleteComparison({ comparisonId }: { comparisonId: number }): Promise<void> {
    const result = await this.comparisonRepository.delete(comparisonId);
    if (!result.affected) {
      throw new NotFoundException('Comparison not found');
    }
  }

  /**
   * Maps comparison entity to response DTO
   */
  private mapToResponseDto(comparison: ImageComparison): ComparisonResponseDto {
    return {
      comparisonId: comparison.comparisonId,
      historicalImageId: comparison.historicalImageId,
      modernImageId: comparison.modernImageId,
      articleId: comparison.articleId,
      description: comparison.description,
      historicalImagePath: comparison.historicalImage?.filePath || null,
      modernImagePath: comparison.modernImage?.filePath || null,
    };
  }
}

