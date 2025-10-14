import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Role entity
 */
@Entity('Roles')
export class Role {
  @PrimaryGeneratedColumn({ name: 'RoleID' })
  roleId!: number;

  @Column({ name: 'RoleName', type: 'varchar', length: 50 })
  roleName!: string;

  @Column({ name: 'Description', type: 'varchar', length: 200, nullable: true })
  description!: string | null;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}

