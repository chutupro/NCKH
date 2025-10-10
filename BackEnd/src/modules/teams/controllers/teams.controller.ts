import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { AppointLeaderDto } from '../dto/appoint-leader.dto';
import { AddMemberDto } from '../dto/add-member.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { SystemRole } from 'src/common/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { log } from 'console';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  create(@Body() dto: CreateTeamDto,@Req() req:any) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }        

    return this.teamsService.create(dto);
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

    return this.teamsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req:any) {
    const user = req.user;
    // log( user.teamMemberships.map(tm => tm.team.id));
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && !+id.includes( user.teamMemberships.map(tm => tm.team.id))) {
      throw new ForbiddenException('Chỉ có thể xem Team của chính mình');
    }  

    return this.teamsService.findOne(+id);
  }

  // PHO_PHONG bổ nhiệm Tổ trưởng
  @Post(':id/appoint-leader')
  appointLeader(
    @Param('id') id: string,
    @Body() dto: AppointLeaderDto,
    @Req() req:any
) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }    
    const allowedRoles = [SystemRole.ADMIN,SystemRole.PHONG_TRUONG,SystemRole.PHO_PHONG];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Không có quyền');
    }        

  return this.teamsService.appointLeader(+id, dto.employeeId, user);
}

  // TO_TRUONG thêm tổ viên
  @Post(':id/members')
  addMember(
  @Param('id') id: string,
  @Body() dto: AddMemberDto,
  @Req() req:any
) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && !+id.includes( user.teamMemberships.map(tm => tm.team.id))) {
      throw new ForbiddenException('Chỉ có thể thêm thành viên Team của chính mình');
    }           
    return this.teamsService.addMember(+id, dto.employeeId, user.id);
}

  // TO_TRUONG xóa tổ viên
  @Delete(':id/members/:employeeId')
  removeMember(
    @Param('id') id: string,
    @Param('employeeId') employeeId: string,
    @Req() req:any
) {
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('Người dùng chưa được xác thực');
    }     if (user.role !== SystemRole.ADMIN && !+id.includes( user.teamMemberships.map(tm => tm.team.id))) {
      throw new ForbiddenException('Chỉ có thể xóa thành viên Team của chính mình');
    }  
  return this.teamsService.removeMember(+id, +employeeId, user.id);
}
}
