import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Users } from './user.entity'; 

@Entity('Notifications')
export class Notifications {
  @PrimaryGeneratedColumn()
  NotificationID: number;

  @Column({ type: 'int', nullable: false })
  UserID: number;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Message: string;

  @Column({ type: 'bit', nullable: true, default: 0 })
  IsRead: boolean;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Users, (user) => user.notifications)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}