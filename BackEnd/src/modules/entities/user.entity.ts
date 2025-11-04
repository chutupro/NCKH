import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Articles } from './article.entity';
import { Comments } from './comment.entity'; 
import { Contributions } from './contribution.entity'; 
import { Feedback } from './feedback.entity';
import { Likes } from './like.entity';
import { ModerationLogs } from './moderation-log.entity'; 
import { Notifications } from './notification.entity';
import { UserProfiles } from './user-profile.entity'; 
import { VersionHistory } from './version-history.entity'; 
import { Roles } from './role.entity';

@Entity('Users')
export class Users {
  @PrimaryGeneratedColumn()
  UserID: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Email: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  PasswordHash: string;

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  FullName: string;

  @Column({ type: 'int', nullable: true })
  RoleID: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // Email Verification Fields
  @Column({ type: 'boolean', default: false })
  IsEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  EmailVerificationToken: string | null;

  @Column({ type: 'datetime', nullable: true })
  EmailVerificationExpiry: Date | null;

  // --- RELATIONS ---
  @OneToOne(() => UserProfiles, (profile) => profile.user)
  profile: UserProfiles;

  @OneToMany(() => Articles, (article) => article.user)
  articles: Articles[];

  @OneToMany(() => Comments, (comment) => comment.user)
  comments: Comments[];

  @OneToMany(() => Contributions, (contribution) => contribution.user)
  contributions: Contributions[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks: Feedback[];

  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];

  @OneToMany(() => ModerationLogs, (log) => log.moderator)
  moderationLogs: ModerationLogs[];

  @OneToMany(() => Notifications, (notification) => notification.user)
  notifications: Notifications[];

  @OneToMany(() => VersionHistory, (versionHistory) => versionHistory.user)
  versionHistory: VersionHistory[];

  @ManyToOne(() => Roles, (role) => role.users)
  @JoinColumn({ name: 'RoleID' })
  role: Roles;
}