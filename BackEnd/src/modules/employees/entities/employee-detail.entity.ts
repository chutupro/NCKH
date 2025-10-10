import { Column, Entity, OneToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity({ name: 'employee_details' })
export class EmployeeDetail {
  @PrimaryColumn() 
  employeeId: number;

  @OneToOne(() => Employee, e => e.detail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column({ length: 20, unique: true }) 
  CCCD: string;

  @Column({ length: 20, nullable: true }) 
  phone?: string;

  @Column({ length: 300, nullable: true }) 
  address?: string;
}
