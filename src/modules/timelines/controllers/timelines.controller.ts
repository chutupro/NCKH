import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TimelinesService } from '../services/timelines.service';
import { CreateTimelineDto } from '../models/dtos/create-timeline.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Timelines controller
 */
@ApiTags('Timelines')
@ApiBearerAuth()
@Controller('timelines')
export class TimelinesController {
  constructor(private readonly timelinesService: TimelinesService) {}

  /**
   * Create timeline
   */
  @Post()
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Create timeline event' })
  @ApiResponse({ status: 201, description: 'Timeline created successfully' })
  async createTimeline(@Body() createTimelineDto: CreateTimelineDto) {
    return this.timelinesService.createTimeline(createTimelineDto);
  }

  /**
   * Get all timelines
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all timelines' })
  @ApiResponse({ status: 200, description: 'Timelines retrieved successfully' })
  async getAllTimelines() {
    return this.timelinesService.getAllTimelines();
  }

  /**
   * Get timeline by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get timeline by ID' })
  @ApiResponse({ status: 200, description: 'Timeline retrieved successfully' })
  async getTimelineById(@Param('id', ParseIntPipe) timelineId: number) {
    return this.timelinesService.getTimelineById({ timelineId });
  }

  /**
   * Get timelines by article
   */
  @Public()
  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get timelines by article' })
  @ApiResponse({ status: 200, description: 'Timelines retrieved successfully' })
  async getTimelinesByArticle(@Param('articleId', ParseIntPipe) articleId: number) {
    return this.timelinesService.getTimelinesByArticle({ articleId });
  }

  /**
   * Delete timeline
   */
  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Delete timeline' })
  @ApiResponse({ status: 200, description: 'Timeline deleted successfully' })
  async deleteTimeline(@Param('id', ParseIntPipe) timelineId: number) {
    await this.timelinesService.deleteTimeline({ timelineId });
    return { message: 'Timeline deleted successfully' };
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Timelines admin test successful' };
  }
}

