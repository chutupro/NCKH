import { Department } from 'src/modules/departments/entities/department.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'companies' })
export class Company {
  @PrimaryGeneratedColumn() 
  id: number;

  @Column({ length: 200 }) 
  name: string;

  @Column({ length: 20, unique: true }) 
  taxCode: string;

  @OneToMany(() => Department, d => d.company) 
  departments: Department[];
}
