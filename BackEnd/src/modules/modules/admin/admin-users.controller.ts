import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminUsersService } from './admin-users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Admin - Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /**
   * Lấy danh sách users với phân trang, tìm kiếm
   * GET /api/admin/users?search=nguyen&page=1&limit=10
   */
  @Get()
  @Roles(Role.ADMIN)
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo tên hoặc email' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'role', required: false, description: 'Lọc theo RoleID' })
  @ApiQuery({ name: 'status', required: false, description: 'active/inactive' })
  async getAllUsers(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminUsersService.getAllUsers({
      search,
      page: parseInt(page),
      limit: parseInt(limit),
      role: role ? parseInt(role) : undefined,
      status,
    });
  }

  /**
   * Lấy thống kê tổng quan
   * GET /api/admin/users/stats/overview
   */
  @Get('stats/overview')
  @Roles(Role.ADMIN)
  async getUserStats() {
    return this.adminUsersService.getUserStats();
  }

  /**
   * Lấy chi tiết user
   * GET /api/admin/users/:id
   */
  @Get(':id')
  @Roles(Role.ADMIN)
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(parseInt(id));
  }

  /**
   * Tạo user mới
   * POST /api/admin/users
   */
  @Post()
  @Roles(Role.ADMIN)
  async createUser(@Body() dto: CreateUserDto) {
    return this.adminUsersService.createUser(dto);
  }

  /**
   * Cập nhật vai trò và trạng thái
   * PATCH /api/admin/users/:id
   */
  @Patch(':id')
  @Roles(Role.ADMIN)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminUsersService.updateUser(parseInt(id), dto);
  }

  /**
   * Xóa user
   * DELETE /api/admin/users/:id
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async deleteUser(@Param('id') id: string) {
    return this.adminUsersService.deleteUser(parseInt(id));
  }
}
