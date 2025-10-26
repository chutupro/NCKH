import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

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

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.userService.findById(Number(id));
  }
}
