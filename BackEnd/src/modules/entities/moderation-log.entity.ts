import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Contributions } from './contribution.entity'; 
import { Users } from './user.entity'; 

@Entity('ModerationLogs')
export class ModerationLogs {
  @PrimaryGeneratedColumn()
  LogID: number;

  @Column({ type: 'int', nullable: true })
  ContributionID: number;

  @Column({ type: 'int', nullable: true })
  ModeratorID: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Action: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  Reason: string;

  @CreateDateColumn({ type: 'datetime' })
  Timestamp: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Contributions, (contribution) => contribution.moderationLogs)
  @JoinColumn({ name: 'ContributionID' })
  contribution: Contributions;

  @ManyToOne(() => Users, (user) => user.moderationLogs)
  @JoinColumn({ name: 'ModeratorID' })
  moderator: Users;
}