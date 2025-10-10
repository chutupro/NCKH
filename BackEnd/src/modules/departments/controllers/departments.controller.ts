import { Controller, Get, Post, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { DepartmentsService } from '../services/departments.service';
import { SystemRole } from 'src/common/enums/role.enum';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() dto: CreateDepartmentDto, @Req() req:any) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }        
      return this.departmentsService.create(dto);
  }

  @Get()
  findAll(@Req() req:any) {
        const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }        
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req:any) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && user.id !== parseInt(id)) {
      throw new ForbiddenException('Chỉ có thể xem thông phòng của chính mình');
    }
    return this.departmentsService.findOne(+id);
  }
}
