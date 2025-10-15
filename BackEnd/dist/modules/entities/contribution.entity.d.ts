import { Article } from './article.entity';
import { User } from './user.entity';
import { ModerationLog } from './moderation-log.entity';
export declare class Contribution {
    ContributionID: number;
    ArticleID: number;
    UserID: number;
    Content: string;
    Status: string;
    SubmittedAt: Date;
    article: Article;
    user: User;
    moderationLogs: ModerationLog[];
}
