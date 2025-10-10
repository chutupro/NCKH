import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article.entity';

@Entity('Timelines')
export class Timeline {
  @PrimaryGeneratedColumn()
  TimelineID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'date', nullable: true })
  EventDate: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;

  @ManyToOne(() => Article, article => article.timelines)
  @JoinColumn({ name: 'ArticleID' })
  article: Article;
}
