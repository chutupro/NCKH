import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';
import { User } from './user.entity';

@Entity('VersionHistory')
export class VersionHistory {
  @PrimaryGeneratedColumn()
  VersionID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'longtext', nullable: true })
  Changes: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  Timestamp: Date;

  @ManyToOne(() => Article, article => article.versionHistories)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;

  @ManyToOne(() => User, user => user.versionHistories)
  @JoinColumn({ name: 'UserID' })
  user: User;
}
