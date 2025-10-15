import { ModerationLogsService } from './moderation_logs.service';
import { CreateModerationLogDto } from './dto/create-moderation_log.dto';
import { UpdateModerationLogDto } from './dto/update-moderation_log.dto';
export declare class ModerationLogsController {
    private readonly moderationLogsService;
    constructor(moderationLogsService: ModerationLogsService);
    create(dto: CreateModerationLogDto): Promise<import("../entities").ModerationLog>;
    findAll(): Promise<import("../entities").ModerationLog[]>;
    findOne(id: string): Promise<import("../entities").ModerationLog>;
    update(id: string, dto: UpdateModerationLogDto): Promise<import("../entities").ModerationLog>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
