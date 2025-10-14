import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { ImageComparison } from './image-comparison.entity';
import { PhotoAnnotation } from './photo-annotation.entity';

/**
 * Image entity
 */
@Entity('Images')
export class Image {
  @PrimaryGeneratedColumn({ name: 'ImageID' })
  imageId!: number;

  @Column({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'FilePath', type: 'varchar', length: 255 })
  filePath!: string;

  @Column({ name: 'AltText', type: 'varchar', length: 200, nullable: true })
  altText!: string | null;

  @Column({ name: 'Type', type: 'varchar', length: 20, default: 'modern' })
  type!: string;

  @Column({ name: 'CaptureDate', type: 'datetime', nullable: true })
  captureDate!: Date | null;

  @Column({ name: 'Location', type: 'varchar', length: 100, nullable: true })
  location!: string | null;

  @ManyToOne(() => Article, (article) => article.images)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @OneToMany(() => ImageComparison, (comparison) => comparison.historicalImage)
  historicalComparisons!: ImageComparison[];

  @OneToMany(() => ImageComparison, (comparison) => comparison.modernImage)
  modernComparisons!: ImageComparison[];

  @OneToMany(() => PhotoAnnotation, (annotation) => annotation.image)
  photoAnnotations!: PhotoAnnotation[];
}

