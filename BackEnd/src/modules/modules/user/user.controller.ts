import { Controller, Get, Param, UseGuards, Req, Put, Body, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('me')
  async me(@Req() req: any) {
    const id = req.user?.sub || req.user?.userId;

    if (!id) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }

    return this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile/me')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;

    if (!userId) {
      throw new UnauthorizedException('You must be logged in to access this resource');
    }

    return this.userService.getUserProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Put('profile/me')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', example: '/img/avatar123.jpg' },
        bio: { type: 'string', example: 'Yêu thích lịch sử Đà Nẵng' },
        fullName: { type: 'string', example: 'Nguyễn Văn A' },
      },
    },
  })
  async updateMyProfile(
    @Req() req: any,
    @Body() body: { avatar?: string; bio?: string; fullName?: string }
  ) {
    const userId = req.user?.sub || req.user?.userId;
    return this.userService.updateUserProfile(userId, body);
  }

  @Get('profile/:id')
  async getUserProfileById(@Param('id') id: string) {
    return this.userService.getUserProfile(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}
