import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Contribution } from './contribution.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Moderation log entity
 */
@Entity('ModerationLogs')
export class ModerationLog {
  @PrimaryGeneratedColumn({ name: 'LogID' })
  logId!: number;

  @Column({ name: 'ContributionID' })
  contributionId!: number;

  @Column({ name: 'ModeratorID' })
  moderatorId!: number;

  @Column({ name: 'Action', type: 'varchar', length: 20 })
  action!: string;

  @Column({ name: 'Reason', type: 'varchar', length: 500, nullable: true })
  reason!: string | null;

  @CreateDateColumn({ name: 'Timestamp' })
  timestamp!: Date;

  @ManyToOne(() => Contribution, (contribution) => contribution.moderationLogs)
  @JoinColumn({ name: 'ContributionID' })
  contribution!: Contribution;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ModeratorID' })
  moderator!: User;
}

