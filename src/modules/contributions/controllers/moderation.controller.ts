import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ModerationService } from '../services/moderation.service';
import { ContributionsService } from '../services/contributions.service';
import { ModerateContributionDto } from '../models/dtos/moderate-contribution.dto';
import { Roles } from '../../../core/decorators/roles.decorator';
import { CurrentUser } from '../../../core/decorators/current-user.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Moderation controller
 */
@ApiTags('Moderation')
@ApiBearerAuth()
@Controller('moderation')
export class ModerationController {
  constructor(
    private readonly moderationService: ModerationService,
    private readonly contributionsService: ContributionsService,
  ) {}

  /**
   * Get pending contributions
   */
  @Get('pending')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Get pending contributions' })
  @ApiResponse({ status: 200, description: 'Pending contributions retrieved' })
  async getPendingContributions() {
    return this.contributionsService.getPendingContributions();
  }

  /**
   * Moderate contribution
   */
  @Post('contributions/:id')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Moderate contribution' })
  @ApiResponse({ status: 200, description: 'Contribution moderated successfully' })
  async moderateContribution(
    @Param('id', ParseIntPipe) contributionId: number,
    @Body() moderateDto: ModerateContributionDto,
    @CurrentUser() user: { userId: number },
  ) {
    await this.moderationService.moderateContribution({
      contributionId,
      moderatorId: user.userId,
      moderateDto,
    });
    return { message: 'Contribution moderated successfully' };
  }

  /**
   * Get moderation logs
   */
  @Get('logs')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Get moderation logs' })
  @ApiResponse({ status: 200, description: 'Moderation logs retrieved' })
  async getModerationLogs() {
    return this.moderationService.getModerationLogs();
  }

  /**
   * Get logs for contribution
   */
  @Get('contributions/:id/logs')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Get logs for contribution' })
  @ApiResponse({ status: 200, description: 'Contribution logs retrieved' })
  async getLogsByContribution(@Param('id', ParseIntPipe) contributionId: number) {
    return this.moderationService.getLogsByContribution({ contributionId });
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Moderation admin test successful' };
  }
}

