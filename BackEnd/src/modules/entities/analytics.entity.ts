import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('Analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  AnalyticsID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', default: 0 })
  ViewCount: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  UpdatedAt: Date;

  @ManyToOne(() => Article, article => article.analytics)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;
}
