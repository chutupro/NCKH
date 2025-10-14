import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ImageComparisonsService } from '../services/image-comparisons.service';
import { CreateComparisonDto } from '../models/dtos/create-comparison.dto';
import { Public } from '../../../core/decorators/public.decorator';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Image comparisons controller
 */
@ApiTags('Image Comparisons')
@ApiBearerAuth()
@Controller('image-comparisons')
export class ImageComparisonsController {
  constructor(private readonly comparisonsService: ImageComparisonsService) {}

  /**
   * Create comparison
   */
  @Post()
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Create image comparison' })
  @ApiResponse({ status: 201, description: 'Comparison created successfully' })
  async createComparison(@Body() createComparisonDto: CreateComparisonDto) {
    return this.comparisonsService.createComparison(createComparisonDto);
  }

  /**
   * Get all comparisons
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all comparisons' })
  @ApiResponse({ status: 200, description: 'Comparisons retrieved successfully' })
  async getAllComparisons() {
    return this.comparisonsService.getAllComparisons();
  }

  /**
   * Get featured comparisons
   */
  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured comparisons' })
  @ApiResponse({ status: 200, description: 'Featured comparisons retrieved' })
  async getFeaturedComparisons(@Query('limit', ParseIntPipe) limit?: number) {
    return this.comparisonsService.getFeaturedComparisons({ limit });
  }

  /**
   * Get comparison by ID
   */
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get comparison by ID' })
  @ApiResponse({ status: 200, description: 'Comparison retrieved successfully' })
  async getComparisonById(@Param('id', ParseIntPipe) comparisonId: number) {
    return this.comparisonsService.getComparisonById({ comparisonId });
  }

  /**
   * Delete comparison
   */
  @Delete(':id')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Delete comparison' })
  @ApiResponse({ status: 200, description: 'Comparison deleted successfully' })
  async deleteComparison(@Param('id', ParseIntPipe) comparisonId: number) {
    await this.comparisonsService.deleteComparison({ comparisonId });
    return { message: 'Comparison deleted successfully' };
  }
}

