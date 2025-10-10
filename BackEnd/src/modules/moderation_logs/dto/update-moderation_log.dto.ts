import { PartialType } from '@nestjs/swagger';
import { CreateModerationLogDto } from './create-moderation_log.dto';

export class UpdateModerationLogDto extends PartialType(CreateModerationLogDto) {}
