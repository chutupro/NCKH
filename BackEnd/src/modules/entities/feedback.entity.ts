// src/modules/entities/feedback.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Articles } from './article.entity';
import { Users } from './user.entity';
import { MapLocations } from './map-location.entity';

@Entity('feedback')
export class Feedback {
  @PrimaryGeneratedColumn()
  FeedbackID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  LocationID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Comment: string;

  @Column({ type: 'int', nullable: true })
  Rating: number;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @ManyToOne(() => Articles, (article) => article.feedbacks)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => MapLocations, (location) => location.feedbacks)
  @JoinColumn({ name: 'LocationID' })
  location: MapLocations;

  @ManyToOne(() => Users, (user) => user.feedbacks)
  @JoinColumn({ name: 'UserID' })
  user: Users;
}