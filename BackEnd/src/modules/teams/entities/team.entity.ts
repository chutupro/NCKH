import { Department } from 'src/modules/departments/entities/department.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TeamMember } from './team-member.entity';

@Entity({ name: 'teams' })
export class Team {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ length: 150 }) 
  name: string;

  @ManyToOne(() => Department, d => d.teams, { onDelete: 'CASCADE' })
  department: Department;

  @OneToMany(() => TeamMember, tm => tm.team, { cascade: true })
  members: TeamMember[];
}
