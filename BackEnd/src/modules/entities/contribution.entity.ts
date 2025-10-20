import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Articles } from './article.entity'; 
import { Users } from './user.entity'; 
import { ModerationLogs } from './moderation-log.entity'; 

@Entity('Contributions')
export class Contributions {
  @PrimaryGeneratedColumn()
  ContributionID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'nvarchar', length: 'max', nullable: true })
  Content: string;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'Pending' })
  Status: string;

  @CreateDateColumn({ type: 'datetime' })
  SubmittedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.contributions)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Users, (user) => user.contributions)
  @JoinColumn({ name: 'UserID' })
  user: Users;

  @OneToMany(() => ModerationLogs, (moderationLog) => moderationLog.contribution)
  moderationLogs: ModerationLogs[];
}