import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { feedbackService } from './Feedback.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: feedbackService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Lấy tất cả phản hồi' })
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Lấy phản hồi theo ID' })
  async findOne(@Param('id') id: number) {
    const feedback = await this.feedbackService.findOne(id);
    if (!feedback) {
      throw new HttpException('Phản hồi không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return feedback;
  }

  @Post()
  @ApiResponse({ status: 200, description: 'Tạo phản hồi mới' })
  create(@Body(new ValidationPipe()) feedbackData: CreateFeedbackDto) {
    return this.feedbackService.create(feedbackData);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Cập nhật phản hồi' })
  update(@Body() feedbackData: UpdateFeedbackDto, @Param('id') id: number) {
    return this.feedbackService.update(id, feedbackData);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Xóa phản hồi' })
  async delete(@Param('id') id: number) {
    const feedback = await this.feedbackService.delete(id);
    if (!feedback) {
      throw new HttpException('Phản hồi không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return feedback;
  }
}
