import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Feedback entity for comments and ratings
 */
@Entity('Feedback')
export class Feedback {
  @PrimaryGeneratedColumn({ name: 'FeedbackID' })
  feedbackId!: number;

  @Column({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'Comment', type: 'varchar', length: 1000, nullable: true })
  comment!: string | null;

  @Column({ name: 'Rating', type: 'tinyint', nullable: true })
  rating!: number | null;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt!: Date;

  @ManyToOne(() => Article, (article) => article.feedbacks)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @ManyToOne(() => User, (user) => user.feedbacks)
  @JoinColumn({ name: 'UserID' })
  user!: User;
}

