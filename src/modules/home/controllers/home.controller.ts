import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HomeService } from '../services/home.service';
import { Public } from '../../../core/decorators/public.decorator';

/**
 * Home page controller
 */
@ApiTags('Home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  /**
   * Get home page data
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Get home page data' })
  @ApiResponse({ status: 200, description: 'Home page data retrieved successfully' })
  async getHomePageData() {
    return this.homeService.getHomePageData();
  }
}

