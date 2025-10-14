import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Article } from './article.entity';
import { Image } from './image.entity';

@Entity('ImageComparisons')
export class ImageComparison {
  @PrimaryGeneratedColumn()
  ComparisonID: number;

  @ManyToOne(() => Image, { nullable: true })
  HistoricalImageID: Image;

  @ManyToOne(() => Image, { nullable: true })
  ModernImageID: Image;

  @ManyToOne(() => Article, { nullable: true })
  ArticleID: Article;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Description: string;
}