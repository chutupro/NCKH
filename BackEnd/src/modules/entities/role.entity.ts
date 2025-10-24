import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Users } from './user.entity'; 

@Entity('Roles')
export class Roles {
  @PrimaryGeneratedColumn()
  RoleID: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  RoleName: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Description: string;

  // --- RELATIONS ---
  @OneToMany(() => Users, (user) => user.role)
  users: Users[];
}