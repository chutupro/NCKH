import { User } from './user.entity';
import { Analytics } from './analytics.entity';
import { Contribution } from './contribution.entity';
import { Feedback } from './feedback.entity';
import { Image } from './image.entity';
import { Timeline } from './timeline.entity';
import { VersionHistory } from './version-history.entity';
export declare class Article {
    ArticleID: number;
    Title: string;
    Content: string;
    Language: string;
    CreatedAt: Date;
    UpdatedAt: Date;
    UserID: number;
    user: User;
    analytics: Analytics[];
    contributions: Contribution[];
    feedbacks: Feedback[];
    images: Image[];
    timelines: Timeline[];
    versionHistories: VersionHistory[];
}
