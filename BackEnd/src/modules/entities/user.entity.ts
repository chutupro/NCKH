import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Article } from './article.entity';
import { Contribution } from './contribution.entity';
import { Feedback } from './feedback.entity';
import { ModerationLog } from './moderation-log.entity';
import { VersionHistory } from './version-history.entity';

@Entity('Users')
export class User {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  Email: string;

  @Column({ type: 'varchar', length: 255 })
  PasswordHash: string;

  @Column({ type: 'varchar', length: 100 })
  FullName: string;

  @Column({ type: 'int', nullable: true })
  RoleID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Role, role => role.users)
  @JoinColumn({ name: 'RoleID' })
  role: Role;

  @OneToMany(() => Article, article => article.user)
  articles: Article[];

  @OneToMany(() => Contribution, contribution => contribution.user)
  contributions: Contribution[];

  @OneToMany(() => Feedback, feedback => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => ModerationLog, moderationLog => moderationLog.moderator)
  moderationLogs: ModerationLog[];

  @OneToMany(() => VersionHistory, versionHistory => versionHistory.user)
  versionHistories: VersionHistory[];
}
