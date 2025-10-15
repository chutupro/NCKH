import { Contribution } from './contribution.entity';
import { User } from './user.entity';
export declare class ModerationLog {
    LogID: number;
    ContributionID: number;
    ModeratorID: number;
    Action: string;
    Reason: string;
    Timestamp: Date;
    contribution: Contribution;
    moderator: User;
}
