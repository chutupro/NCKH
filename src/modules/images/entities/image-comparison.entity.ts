import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from './image.entity';
import { Article } from '../../articles/entities/article.entity';

/**
 * Image comparison entity for then/now photos
 */
@Entity('ImageComparisons')
export class ImageComparison {
  @PrimaryGeneratedColumn({ name: 'ComparisonID' })
  comparisonId!: number;

  @Column({ name: 'HistoricalImageID', nullable: true })
  historicalImageId!: number | null;

  @Column({ name: 'ModernImageID', nullable: true })
  modernImageId!: number | null;

  @Column({ name: 'ArticleID', nullable: true })
  articleId!: number | null;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @ManyToOne(() => Image, (image) => image.historicalComparisons)
  @JoinColumn({ name: 'HistoricalImageID' })
  historicalImage!: Image;

  @ManyToOne(() => Image, (image) => image.modernComparisons)
  @JoinColumn({ name: 'ModernImageID' })
  modernImage!: Image;

  @ManyToOne(() => Article, (article) => article.imageComparisons)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;
}

