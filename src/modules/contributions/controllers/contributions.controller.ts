import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContributionsService } from '../services/contributions.service';
import { CreateContributionDto } from '../models/dtos/create-contribution.dto';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';

/**
 * Contributions controller
 */
@ApiTags('Contributions')
@ApiBearerAuth()
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  /**
   * Create contribution
   */
  @Post()
  @ApiOperation({ summary: 'Create new contribution' })
  @ApiResponse({ status: 201, description: 'Contribution created successfully' })
  async createContribution(
    @Body() createContributionDto: CreateContributionDto,
    @CurrentUser() user: { userId: number },
  ) {
    return this.contributionsService.createContribution({ userId: user.userId, createContributionDto });
  }

  /**
   * Get all contributions
   */
  @Get()
  @ApiOperation({ summary: 'Get all contributions' })
  @ApiResponse({ status: 200, description: 'Contributions retrieved successfully' })
  async getAllContributions() {
    return this.contributionsService.getAllContributions();
  }

  /**
   * Get user contributions
   */
  @Get('my-contributions')
  @ApiOperation({ summary: 'Get current user contributions' })
  @ApiResponse({ status: 200, description: 'User contributions retrieved' })
  async getUserContributions(@CurrentUser() user: { userId: number }) {
    return this.contributionsService.getContributionsByUser({ userId: user.userId });
  }

  /**
   * Get contribution by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get contribution by ID' })
  @ApiResponse({ status: 200, description: 'Contribution retrieved successfully' })
  async getContributionById(@Param('id', ParseIntPipe) contributionId: number) {
    return this.contributionsService.getContributionById({ contributionId });
  }
}

