import { Company } from 'src/modules/companies/entities/company.entity';
import { Employee } from 'src/modules/employees/entities/employee.entity';
import { Team } from 'src/modules/teams/entities/team.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'departments' })
export class Department {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ length: 150 }) 
  name: string;

  @ManyToOne(() => Company, c => c.departments, { onDelete: 'CASCADE' })
  company: Company;

  @OneToMany(() => Employee, e => e.department) 
  employees: Employee[];

  @OneToMany(() => Team, t => t.department) 
  teams: Team[];
}
