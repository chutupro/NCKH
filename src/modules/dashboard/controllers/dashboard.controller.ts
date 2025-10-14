import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { Roles } from '../../../core/decorators/roles.decorator';
import { ROLES } from '../../../shared/constants/roles.constant';

/**
 * Dashboard controller
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Get dashboard statistics
   */
  @Get('stats')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  /**
   * Get user statistics
   */
  @Get('users')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved' })
  async getUserStats() {
    return this.dashboardService.getUserStats();
  }

  /**
   * Get article statistics
   */
  @Get('articles')
  @Roles(ROLES.ADMIN, ROLES.MODERATOR)
  @ApiOperation({ summary: 'Get article statistics' })
  @ApiResponse({ status: 200, description: 'Article statistics retrieved' })
  async getArticleStats() {
    return this.dashboardService.getArticleStats();
  }

  /**
   * Smoke test endpoint for admin
   */
  @Get('admin/test')
  @Roles(ROLES.ADMIN)
  @ApiOperation({ summary: 'Admin smoke test' })
  @ApiResponse({ status: 200, description: 'Test successful' })
  async adminTest() {
    return { message: 'Dashboard admin test successful' };
  }
}

