import { Article } from './article.entity';
import { User } from './user.entity';
export declare class Feedback {
    FeedbackID: number;
    ArticleID: number;
    UserID: number;
    Comment: string;
    Rating: number;
    CreatedAt: Date;
    article: Article;
    user: User;
}
