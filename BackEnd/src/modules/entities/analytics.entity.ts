import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Articles } from './article.entity'; 

@Entity('Analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  AnalyticsID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  ViewCount: number;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedAt: Date;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.analytics)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;
}