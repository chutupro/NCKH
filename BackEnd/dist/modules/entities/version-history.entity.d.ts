import { Article } from './article.entity';
import { User } from './user.entity';
export declare class VersionHistory {
    VersionID: number;
    ArticleID: number;
    UserID: number;
    Changes: string;
    Timestamp: Date;
    article: Article;
    user: User;
}
