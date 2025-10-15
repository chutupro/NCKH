import { Repository } from 'typeorm';
import { ModerationLog } from '../entities';
import { CreateModerationLogDto } from './dto/create-moderation_log.dto';
import { UpdateModerationLogDto } from './dto/update-moderation_log.dto';
import { Contribution } from '../entities';
import { User } from '../entities';
export declare class ModerationLogsService {
    private moderationLogRepo;
    private contributionRepo;
    private userRepo;
    constructor(moderationLogRepo: Repository<ModerationLog>, contributionRepo: Repository<Contribution>, userRepo: Repository<User>);
    create(dto: CreateModerationLogDto): Promise<ModerationLog>;
    findAll(): Promise<ModerationLog[]>;
    findOne(id: number): Promise<ModerationLog>;
    update(id: number, dto: UpdateModerationLogDto): Promise<ModerationLog>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
