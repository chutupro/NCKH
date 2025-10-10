import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Analytics } from './analytics.entity';
import { Contribution } from './contribution.entity';
import { Feedback } from './feedback.entity';
import { Image } from './image.entity';
import { Timeline } from './timeline.entity';
import { VersionHistory } from './version-history.entity';

@Entity('Articles')
export class Article {
  @PrimaryGeneratedColumn()
  ArticleID: number;

  @Column({ type: 'varchar', length: 200 })
  Title: string;

  @Column({ type: 'longtext', nullable: true })
  Content: string;

  @Column({ type: 'varchar', length: 10, default: 'vi' })
  Language: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  UpdatedAt: Date;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @ManyToOne(() => User, user => user.articles)
  @JoinColumn({ name: 'UserID' })
  user: User;

  @OneToMany(() => Analytics, analytics => analytics.article)
  analytics: Analytics[];

  @OneToMany(() => Contribution, contribution => contribution.article)
  contributions: Contribution[];

  @OneToMany(() => Feedback, feedback => feedback.article)
  feedbacks: Feedback[];

  @OneToMany(() => Image, image => image.article)
  images: Image[];

  @OneToMany(() => Timeline, timeline => timeline.article)
  timelines: Timeline[];

  @OneToMany(() => VersionHistory, versionHistory => versionHistory.article)
  versionHistories: VersionHistory[];
}
