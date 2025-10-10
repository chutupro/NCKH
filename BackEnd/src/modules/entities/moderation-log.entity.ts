import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Contribution } from './contribution.entity';
import { User } from './user.entity';

@Entity('ModerationLogs')
export class ModerationLog {
  @PrimaryGeneratedColumn()
  LogID: number;

  @Column({ type: 'int', nullable: true })
  ContributionID: number;

  @Column({ type: 'int', nullable: true })
  ModeratorID: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  Action: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Reason: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  Timestamp: Date;

  @ManyToOne(() => Contribution, contribution => contribution.moderationLogs)
  @JoinColumn({ name: 'ContributionID' })
  contribution: Contribution;

  @ManyToOne(() => User, user => user.moderationLogs)
  @JoinColumn({ name: 'ModeratorID' })
  moderator: User;
}
