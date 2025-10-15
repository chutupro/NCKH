import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/articles.create.dto';
import { UpdateArticleDto } from './dto/articles.update.dto';
export declare class ArticlesController {
    private readonly articlesService;
    constructor(articlesService: ArticlesService);
    findAll(): Promise<import("../entities").Article[]>;
    findOne(id: number): Promise<import("../entities").Article>;
    create(createDto: CreateArticleDto): Promise<import("../entities").Article>;
    update(id: number, updateDto: UpdateArticleDto): Promise<import("../entities").Article>;
    replace(id: number, createDto: CreateArticleDto): Promise<import("../entities").Article>;
    remove(id: number): Promise<{
        deleted: boolean;
        id: number;
    }>;
}
