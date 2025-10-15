import { Article } from './article.entity';
export declare class Image {
    ImageID: number;
    ArticleID: number;
    FilePath: string;
    AltText: string;
    Type: string;
    article: Article;
}
