import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { CreateArticleDto } from '../models/dtos/create-article.dto';
import { UpdateArticleDto } from '../models/dtos/update-article.dto';
import { ArticleResponseDto } from '../models/dtos/article-response.dto';
import { ArticleListQueryDto } from '../models/dtos/article-list-query.dto';
import { PaginatedResponse } from '../../../shared/types/common.types';

/**
 * Articles service
 */
@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  /**
   * Creates new article
   */
  async createArticle({ userId, createArticleDto }: { userId: number; createArticleDto: CreateArticleDto }): Promise<ArticleResponseDto> {
    const article = this.articleRepository.create({
      ...createArticleDto,
      userId,
    });
    const savedArticle = await this.articleRepository.save(article);
    return this.getArticleById({ articleId: savedArticle.articleId });
  }

  /**
   * Gets article by ID
   */
  async getArticleById({ articleId }: { articleId: number }): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.findOne({
      where: { articleId },
      relations: ['user', 'analytics'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return this.mapToResponseDto(article);
  }

  /**
   * Gets articles with pagination and filters
   */
  async getArticles(query: ArticleListQueryDto): Promise<PaginatedResponse<ArticleResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.user', 'user')
      .leftJoinAndSelect('article.analytics', 'analytics');
    if (query.search) {
      queryBuilder.where('article.title LIKE :search', { search: `%${query.search}%` });
    }
    if (query.language) {
      queryBuilder.andWhere('article.language = :language', { language: query.language });
    }
    if (query.sortBy === 'viewCount') {
      queryBuilder.orderBy('analytics.viewCount', query.sortOrder || 'DESC');
    } else {
      queryBuilder.orderBy('article.createdAt', query.sortOrder || 'DESC');
    }
    const [articles, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();
    const data = articles.map((article) => this.mapToResponseDto(article));
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Updates article
   */
  async updateArticle({
    articleId,
    userId,
    userRole,
    updateArticleDto,
  }: {
    articleId: number;
    userId: number;
    userRole: string;
    updateArticleDto: UpdateArticleDto;
  }): Promise<ArticleResponseDto> {
    const article = await this.articleRepository.findOne({ where: { articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.userId !== userId && userRole !== 'Admin') {
      throw new ForbiddenException('You can only edit your own articles');
    }
    Object.assign(article, updateArticleDto);
    article.updatedAt = new Date();
    await this.articleRepository.save(article);
    return this.getArticleById({ articleId });
  }

  /**
   * Deletes article
   */
  async deleteArticle({
    articleId,
    userId,
    userRole,
  }: {
    articleId: number;
    userId: number;
    userRole: string;
  }): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.userId !== userId && userRole !== 'Admin') {
      throw new ForbiddenException('You can only delete your own articles');
    }
    await this.articleRepository.delete(articleId);
  }

  /**
   * Maps article entity to response DTO
   */
  private mapToResponseDto(article: Article): ArticleResponseDto {
    return {
      articleId: article.articleId,
      title: article.title,
      content: article.content,
      language: article.language,
      authorName: article.user.fullName,
      authorId: article.user.userId,
      viewCount: article.analytics?.viewCount || 0,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}

