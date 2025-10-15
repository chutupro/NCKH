import { Article } from './article.entity';
export declare class Timeline {
    TimelineID: number;
    ArticleID: number;
    EventDate: Date;
    Description: string;
    article: Article;
}
