import { Controller, Get, Post, Put, Body, Param, UseGuards, UseInterceptors, ClassSerializerInterceptor, Req, ForbiddenException, Patch, UseFilters } from '@nestjs/common';
import { EmployeesService } from '../services/employees.service';
import { UpdateEmployeeDetailDto } from '../dto/update-employee-detail.dto';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SystemRole } from 'src/common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { updateEmployee } from '../dto/update-employee.dto';
import { log } from 'console';



@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard) 
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post() 
  create(@Body() dto: CreateEmployeeDto, @Req() req: any) {
    
    const user = req.user;
    if (!user) {
      throw new ForbiddenException({message:'Người dùng chưa được xác thực'});
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG,SystemRole.TO_TRUONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }    
    return this.employeesService.create(dto);
  }

  @Get()
  findAll(@Req() req: any) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG,SystemRole.TO_TRUONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }        
    return this.employeesService.findAll();
    // log(user.teamMemberships.map(tm => tm.team.id))
    // return(user)
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: any) {
   const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && user.id !== parseInt(id)) {
      throw new ForbiddenException('Chỉ có thể xem thông tin của chính mình');
    }   
     return this.employeesService.findOne(+id);
  }

  @Put(':id/detail')
  updateDetail(@Param('id') id: string, @Body() dto: UpdateEmployeeDetailDto, @Req() req: any) {
   const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && user.id !== parseInt(id)) {
      throw new ForbiddenException('Chỉ có thể cập nhật thông tin của chính mình');
    }    return this.employeesService.updateDetail(+id, dto);
  }
  @Patch(':id')
  updateEmploy(@Param('id') id: string, @Body() dto: updateEmployee, @Req() req: any) {
   const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && user.id !== parseInt(id)) {
      throw new ForbiddenException('Chỉ có thể cập nhật thông tin của chính mình');
    }    return this.employeesService.updateEmployee(+id, dto);
  }
}
