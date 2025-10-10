import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from '../entities/feedback.entity';
import { FeedbackService } from './Feedback.service';


@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const feedback = await this.feedbackService.findOne(id);
    if (!feedback) {
      throw new HttpException('Phản hồi không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return feedback;
  }

  @Post()
  create(@Body(new ValidationPipe()) feedbackData: CreateFeedbackDto) {
    return this.feedbackService.create(feedbackData);
  }

  @Patch(':id')
  update(@Body() feedbackData: UpdateFeedbackDto, @Param('id') id: number) {
    return this.feedbackService.update(id, feedbackData);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    const feedback = await this.feedbackService.delete(id);
    if (!feedback) {
      throw new HttpException('Phản hồi không tìm thấy', HttpStatus.NOT_FOUND);
    }
    return feedback;
  }
}