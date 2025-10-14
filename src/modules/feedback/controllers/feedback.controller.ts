import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackService } from '../services/feedback.service';
import { CreateFeedbackDto } from '../models/dtos/create-feedback.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Feedback controller
 */
@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  /**
   * Create feedback
   */
  @Post()
  @ApiOperation({ summary: 'Create feedback' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  async createFeedback(
    @Body() createFeedbackDto: CreateFeedbackDto,
    @CurrentUser() user: { userId: number },
  ) {
    return this.feedbackService.createFeedback({ userId: user.userId, createFeedbackDto });
  }

  /**
   * Get feedback for article
   */
  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get feedback for article' })
  @ApiResponse({ status: 200, description: 'Feedback retrieved successfully' })
  async getFeedbackByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.feedbackService.getFeedbackByArticle({ articleId });
  }

  /**
   * Delete feedback
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  async deleteFeedback(
    @Param('id', ParseIntPipe) feedbackId: number,
    @CurrentUser() user: { userId: number },
  ) {
    await this.feedbackService.deleteFeedback({ feedbackId, userId: user.userId });
    return { message: 'Feedback deleted successfully' };
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Feedback admin test successful' };
  }
}

