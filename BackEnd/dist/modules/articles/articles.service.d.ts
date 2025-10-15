import { Article } from 'src/modules/entities';
import { Repository } from 'typeorm';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';
export declare class ArticlesService {
    private readonly articleRepository;
    constructor(articleRepository: Repository<Article>);
    findAll(): Promise<Article[]>;
    findOne(id: number): Promise<Article>;
    create(createDto: CreateArticleDto): Promise<Article>;
    update(id: number, updateDto: UpdateArticleDto): Promise<Article>;
    replace(id: number, createDto: CreateArticleDto): Promise<Article>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
