import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn()
  RoleID: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  RoleName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Description: string;

  @OneToMany(() => User, user => user.role)
  users: User[];
}
