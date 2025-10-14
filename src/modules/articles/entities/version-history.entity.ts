import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Article } from './article.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Version history entity for tracking article edits
 */
@Entity('VersionHistory')
export class VersionHistory {
  @PrimaryGeneratedColumn({ name: 'VersionID' })
  versionId!: number;

  @Column({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'Content', type: 'longtext' })
  content!: string;

  @CreateDateColumn({ name: 'ModifiedAt' })
  modifiedAt!: Date;

  @ManyToOne(() => Article, (article) => article.versionHistories)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @ManyToOne(() => User, (user) => user.versionHistories)
  @JoinColumn({ name: 'UserID' })
  user!: User;
}

