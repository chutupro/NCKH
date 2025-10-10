import {Controller,Get,Post,Body,Param,Delete,Put, Patch,BadRequestException,NotFoundException,ParseIntPipe} from '@nestjs/common';
import { ModerationLogsService } from './moderation_logs.service'; 
import { CreateModerationLogDto } from './dto/create-moderation_log.dto'; 
import { UpdateModerationLogDto } from './dto/update-moderation_log.dto'; 

@Controller('moderation-logs')
export class ModerationLogsController {
  constructor(private readonly moderationLogsService: ModerationLogsService) {}

  @Post()
  async create(@Body() dto: CreateModerationLogDto) {
    try {
      return await this.moderationLogsService.create(dto);
    } catch (error) {
      throw new BadRequestException('Không thể tạo bản ghi Moderation Log: ' + error.message);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.moderationLogsService.findAll();
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy danh sách Moderation Logs');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const log = await this.moderationLogsService.findOne(+id);
      if (!log) throw new NotFoundException(`Không tìm thấy log có ID = ${id}`);
      return log;
    } catch (error) {
      throw new BadRequestException('Lỗi khi lấy Moderation Log: ' + error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateModerationLogDto) {
    try {
      const updated = await this.moderationLogsService.update(+id, dto);
      if (!updated) throw new NotFoundException(`Không tìm thấy log để cập nhật (ID = ${id})`);
      return updated;
    } catch (error) {
      throw new BadRequestException('Lỗi khi cập nhật Moderation Log: ' + error.message);
    }
  }


  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const deleted = await this.moderationLogsService.remove(+id);
      if (!deleted) throw new NotFoundException(`Không tìm thấy log để xóa (ID = ${id})`);
      return { message: `Đã xóa Moderation Log có ID = ${id}` };
    } catch (error) {
      throw new BadRequestException('Lỗi khi xóa Moderation Log: ' + error.message);
    }
  }
}
