import { Role } from './role.entity';
import { Article } from './article.entity';
import { Contribution } from './contribution.entity';
import { Feedback } from './feedback.entity';
import { ModerationLog } from './moderation-log.entity';
import { VersionHistory } from './version-history.entity';
export declare class User {
    UserID: number;
    Email: string;
    PasswordHash: string;
    FullName: string;
    RoleID: number;
    CreatedAt: Date;
    role: Role;
    articles: Article[];
    contributions: Contribution[];
    feedbacks: Feedback[];
    moderationLogs: ModerationLog[];
    versionHistories: VersionHistory[];
}
