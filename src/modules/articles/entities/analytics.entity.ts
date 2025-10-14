import { Entity, Column, OneToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Article } from './article.entity';

/**
 * Analytics entity for tracking article views
 */
@Entity('Analytics')
export class Analytics {
  @PrimaryColumn({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'ViewCount', type: 'int', default: 0 })
  viewCount!: number;

  @OneToOne(() => Article, (article) => article.analytics)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;
}

