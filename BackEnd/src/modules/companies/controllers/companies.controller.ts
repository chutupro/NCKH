import { Body, Controller, ForbiddenException, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SystemRole } from 'src/common/enums/role.enum';
import { log } from 'console';
import { ApiBearerAuth } from '@nestjs/swagger';

// @ApiBearerAuth('JWT-auth')
// @UseGuards(JwtAuthGuard) 
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto,@Req() req: any) {
  //   const user = req.user;
  //   if (!user) {
  //     throw new ForbiddenException('Người dùng chưa được xác thực');
  //   }    
  //   const allowedRoles = [SystemRole.ADMIN];
  //   if (!allowedRoles.includes(user.role)) {
  //     throw new ForbiddenException('Không có quyền');
  //   }
  //   return this.companiesService.create(dto);
    return this.companiesService.createQuery(dto);

  }

  @Get()
  findAll(@Req() req: any) {
    //const user = req.user ;
    // if (!user) {
    //   throw new ForbiddenException('User not authenticated');
    // }     
    // const allowedRoles = [SystemRole.ADMIN];
    // if (!allowedRoles.includes(user.role)) {
    //   throw new ForbiddenException('Không có quyền');
    // }
    //// log(user)
    // return this.companiesService.findAll();
    return this.companiesService.findAllQuery();
    
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: any) {
    // const user = req.user;
    // if (!user) {
    //   throw new ForbiddenException('Người dùng chưa được xác thực');
    // }     if (user.role !== SystemRole.ADMIN  && user.id !== parseInt(id)) {
    //   throw new ForbiddenException('Chỉ có thể xem thông tin công ty của chính mình');
    // }
    // return this.companiesService.findOne(+id);
    return this.companiesService.findOneQuery(+id);

  }
}
