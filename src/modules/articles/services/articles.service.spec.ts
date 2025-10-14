import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticlesService } from './articles.service';
import { Article } from '../entities/article.entity';
import { NotFoundException } from '@nestjs/common';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let repository: Repository<Article>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockArticle = {
    articleId: 1,
    title: 'Test Article',
    content: 'Test Content',
    language: 'en',
    userId: 1,
    createdAt: new Date(),
    updatedAt: null,
    user: {
      userId: 1,
      fullName: 'Test User',
      email: 'test@example.com',
    },
    analytics: {
      viewCount: 0,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockRepository,
        },
      ],
    }).compile();
    service = module.get<ArticlesService>(ArticlesService);
    repository = module.get<Repository<Article>>(getRepositoryToken(Article));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createArticle', () => {
    it('should create an article', async () => {
      const createArticleDto = {
        title: 'Test Article',
        content: 'Test Content',
        language: 'en',
      };
      const userId = 1;
      mockRepository.create.mockReturnValue(mockArticle);
      mockRepository.save.mockResolvedValue(mockArticle);
      mockRepository.findOne.mockResolvedValue(mockArticle);
      const result = await service.createArticle({ userId, createArticleDto });
      expect(result).toBeDefined();
      expect(result.title).toBe(createArticleDto.title);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('getArticleById', () => {
    it('should return an article', async () => {
      mockRepository.findOne.mockResolvedValue(mockArticle);
      const result = await service.getArticleById({ articleId: 1 });
      expect(result).toBeDefined();
      expect(result.articleId).toBe(1);
    });

    it('should throw NotFoundException when article not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.getArticleById({ articleId: 999 })).rejects.toThrow(NotFoundException);
    });
  });
});

