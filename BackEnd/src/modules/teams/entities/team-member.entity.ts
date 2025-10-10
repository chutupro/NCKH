import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Team } from './team.entity';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { RoleInTeam } from 'src/common/enums/role.enum';

@Entity({ name: 'team_members' })
@Unique(['team', 'employee'])
export class TeamMember {
  @PrimaryGeneratedColumn() 
  id: number;

  @ManyToOne(() => Team, t => t.members, { onDelete: 'CASCADE' })
  team: Team;

  @ManyToOne(() => Employee, e => e.teamMemberships, { onDelete: 'CASCADE' })
  employee: Employee;

  @Column({ type: 'enum', enum: RoleInTeam, default: RoleInTeam.MEMBER })
  roleInTeam: RoleInTeam;
}
