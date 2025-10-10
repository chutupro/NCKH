import {Controller,Get,Post,Body,Param,Delete,Put, Patch,} from '@nestjs/common';
import { ModerationLogsService } from './moderation_logs.service'; 
import { CreateModerationLogDto } from './dto/create-moderation_log.dto'; 
import { UpdateModerationLogDto } from './dto/update-moderation_log.dto'; 

@Controller('moderation-logs')
export class ModerationLogsController {
  constructor(private readonly moderationLogsService: ModerationLogsService) {}

  @Post()
  create(@Body() dto: CreateModerationLogDto) {
    return this.moderationLogsService.create(dto);
  }

  @Get()
  findAll() {
    return this.moderationLogsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moderationLogsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModerationLogDto) {
    return this.moderationLogsService.update(+id, dto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moderationLogsService.remove(+id);
  }
}
