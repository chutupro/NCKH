<<<<<<< Updated upstream
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
=======
// src/modules/entities/feedback.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
>>>>>>> Stashed changes
import { Articles } from './article.entity';
import { Users } from './user.entity'; 

@Entity('Feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  FeedbackID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Comment: string;

  @Column({ type: 'int', nullable: true })
  Rating: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.feedbacks)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Users, (user) => user.feedbacks)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}