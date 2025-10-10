import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Department } from 'src/modules/departments/entities/department.entity';
import { SystemRole } from 'src/common/enums/role.enum';
import { EmployeeDetail } from './employee-detail.entity';
import { TeamMember } from 'src/modules/teams/entities/team-member.entity';

@Entity({ name: 'employees' })
export class Employee {
  @PrimaryGeneratedColumn() 
  id: number;

  @ManyToOne(() => Department, d => d.employees, { onDelete: 'NO ACTION' })
  department: Department;

  @Column({ length: 150 }) 
  fullName: string;

  @Column({ length: 255, unique: true }) 
  email: string;

  @Exclude()
  @Column({ length: 255 }) 
  passwordHash: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 }) 
  baseSalary: number;

  @Column({ type: 'date' }) 
  joinedAt: string;

  @Column({ type: 'enum', enum: SystemRole, default: SystemRole.NHAN_VIEN })
  role: SystemRole;

  @OneToOne(() => EmployeeDetail, d => d.employee, { cascade: true })
  detail: EmployeeDetail;

  @OneToMany(() => TeamMember, tm => tm.employee) 
  teamMemberships: TeamMember[];
}
