import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';
import { ModerationLog } from './moderation-log.entity';

/**
 * Contribution entity
 */
@Entity('Contributions')
export class Contribution {
  @PrimaryGeneratedColumn({ name: 'ContributionID' })
  contributionId!: number;

  @Column({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'Content', type: 'longtext' })
  content!: string;

  @Column({ name: 'Status', type: 'varchar', length: 20, default: 'Pending' })
  status!: string;

  @CreateDateColumn({ name: 'SubmittedAt' })
  submittedAt!: Date;

  @ManyToOne(() => Article, (article) => article.contributions)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @ManyToOne(() => User, (user) => user.contributions)
  @JoinColumn({ name: 'UserID' })
  user!: User;

  @OneToMany(() => ModerationLog, (log) => log.contribution)
  moderationLogs!: ModerationLog[];
}

