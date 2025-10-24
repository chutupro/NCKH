import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity'; 

@Entity('UserProfiles')
export class UserProfiles {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Avatar: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Bio: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  TotalContributions: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  TotalEdits: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  TotalLikes: number;

  // --- RELATIONS ---
  @OneToOne(() => Users, (user) => user.profile)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}