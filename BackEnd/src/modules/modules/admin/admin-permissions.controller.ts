import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AdminPermissionsService } from './admin-permissions.service';

@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminPermissionsController {
  constructor(private readonly permissionsService: AdminPermissionsService) {}

  /**
   * Lấy thống kê số lượng user theo role
   * GET /admin/permissions/roles/stats
   */
  @Get('roles/stats')
  async getRoleStats() {
    return this.permissionsService.getRoleStats();
  }

  /**
   * Lấy quyền của một role
   * GET /admin/permissions/roles/:role
   */
  @Get('roles/:role')
  async getPermissions(@Param('role') role: string) {
    return this.permissionsService.getPermissions(role);
  }

  /**
   * Cập nhật quyền của một role
   * PATCH /admin/permissions/roles/:role
   */
  @Patch('roles/:role')
  async updatePermissions(
    @Param('role') role: string,
    @Body() permissions: { content: string[]; users: string[] },
  ) {
    return this.permissionsService.updatePermissions(role, permissions);
  }
}
