import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Article } from './article.entity';
import { User } from './user.entity';
import { ModerationLog } from './moderation-log.entity';

@Entity('Contributions')
export class Contribution {
  @PrimaryGeneratedColumn()
  ContributionID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'longtext', nullable: true })
  Content: string;

  @Column({ type: 'varchar', length: 20, default: 'Pending' })
  Status: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  SubmittedAt: Date;

  @ManyToOne(() => Article, article => article.contributions)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;

  @ManyToOne(() => User, user => user.contributions)
  @JoinColumn({ name: 'UserID' })
  user: User;

  @OneToMany(() => ModerationLog, moderationLog => moderationLog.contribution)
  moderationLogs: ModerationLog[];
}
