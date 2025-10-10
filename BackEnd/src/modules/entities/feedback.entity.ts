import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Check } from 'typeorm';
import { Article } from './article.entity';
import { User } from './user.entity';

@Entity('Feedback')
@Check(`"Rating" >= 0 AND "Rating" <= 5`)
export class Feedback {
  @PrimaryGeneratedColumn()
  FeedbackID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Comment: string;

  @Column({ type: 'int', nullable: true })
  Rating: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Article, article => article.feedbacks)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;

  @ManyToOne(() => User, user => user.feedbacks)
  @JoinColumn({ name: 'UserID' })
  user: User;
}
