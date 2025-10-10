import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { CreateTeamDto } from '../dto/create-team.dto';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { RoleInTeam, SystemRole } from 'src/common/enums/role.enum';
import { EmployeesService } from 'src/modules/employees/services/employees.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamRepo: Repository<Team>,
    @InjectRepository(TeamMember)
    private tmRepo: Repository<TeamMember>,
    
    private employeeRepo: EmployeesService
  ) {}

  async create(dto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepo.create({
      name: dto.name,
      department: { id: dto.departmentId } as any,
    });
    return this.teamRepo.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepo.find({
      relations: ['department', 'members', 'members.employee'],
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepo.findOne({
      where: { id },
      relations: ['department', 'members', 'members.employee'],
    });
    if (!team) {
      throw new NotFoundException('Không tìm thấy nhóm');
    }
    return team;
  }

  // PHO_PHONG bổ nhiệm Tổ trưởng (chỉ cùng phòng)
  async appointLeader(teamId: number, employeeId: number, actor: Employee): Promise<{ message: string }> {
    const team = await this.teamRepo.findOne({
      where: { id: teamId },
      relations: ['department'],
    });
    if (!team) {
      throw new NotFoundException('Không tìm thấy nhóm');
    }

    
    // Kiểm tra quyền: PHO_PHONG và cùng phòng
      const allowedRoles = [SystemRole.ADMIN,SystemRole.PHO_PHONG];
    if (!allowedRoles.includes(actor.role) || actor.department.id !== team.department.id) {
      throw new ForbiddenException('Chỉ có phó phòng của phòng ban này mới có thể bổ nhiệm tổ trưởng');
    }

    // Hạ tất cả leader hiện tại về member
    await this.tmRepo.update(
      { team: { id: teamId }, roleInTeam: RoleInTeam.LEADER },
      { roleInTeam: RoleInTeam.MEMBER },
    );
    

    // Kiểm tra employee đã là thành viên chưa
    const existing = await this.tmRepo.findOne({
      where: { team: { id: teamId }, employee: { id: employeeId } },
    });

    if (!existing) {
      // Thêm mới với vai trò LEADER
      const newMember = this.tmRepo.create({
        team: { id: teamId } as any,
        employee: { id: employeeId } as any,
        roleInTeam: RoleInTeam.LEADER,
      });
      await this.tmRepo.save(newMember);
    } else {
      // Nâng cấp thành LEADER
      await this.tmRepo.update(existing.id, { roleInTeam: RoleInTeam.LEADER});
    }

    return { message: 'Bổ nhiệm tổ trưởng thành công' };
  }

  // Kiểm tra actor có phải leader của team không
  private async ensureActorIsLeader(teamId: number, actorId: number): Promise<void> {
    const checkAdmin= await this.employeeRepo.checkAdmin(actorId);
    if(!checkAdmin){
    const leader = await this.tmRepo.findOne({
      where: {
        team: { id: teamId },
        employee: { id: actorId },
        roleInTeam: RoleInTeam.LEADER
      },
    });
    if (!leader) {
      throw new ForbiddenException('Chỉ có tổ trưởng mới có thể quản lý thành viên');
    }
  }
}

  // TO_TRUONG thêm tổ viên
  async addMember(teamId: number, employeeId: number, actorId: number): Promise<TeamMember> {
    await this.ensureActorIsLeader(teamId, actorId);

    const exists = await this.tmRepo.findOne({
      where: { team: { id: teamId }, employee: { id: employeeId } }
    });

    if (exists) {
      return exists;
    }

    const member = this.tmRepo.create({
      team: { id: teamId } as any,
      employee: { id: employeeId } as any,
      roleInTeam: RoleInTeam.MEMBER
    });

    return this.tmRepo.save(member);
  }

  // TO_TRUONG xóa tổ viên
  async removeMember(teamId: number, employeeId: number, actorId: number): Promise<{ message: string }> {
    await this.ensureActorIsLeader(teamId, actorId);
    const exists = await this.tmRepo.findOne({
      where: { team: { id: teamId }, employee: { id: employeeId } }
    });
    if(!exists){
      return { message: 'Không tồn tại' }
    }

    await this.tmRepo.delete({
      team: { id: teamId } as any,
      employee: { id: employeeId } as any,
    });
    
    return { message: 'Xóa thành viên thành công' };
  }
}
