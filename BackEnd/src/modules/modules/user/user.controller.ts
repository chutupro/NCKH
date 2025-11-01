import { Controller, Get, Param, UseGuards, Req, Put, Body } from '@nestjs/common';
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
    return this.userService.findById(id);
  }

  // ✅ Lấy User Profile đầy đủ (bao gồm avatar, bio, stats)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('profile/me')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.userService.getUserProfile(userId);
  }

  // ✅ Cập nhật User Profile
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

  // ✅ Xem profile của user khác (public)
  @Get('profile/:id')
  async getUserProfileById(@Param('id') id: string) {
    return this.userService.getUserProfile(Number(id));
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}
