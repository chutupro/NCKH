// src/modules/entities/image-comparison.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Articles } from './article.entity';
import { Categories } from './category.entity';
import { Images } from './image.entity';
import { Users } from './user.entity';

@Entity('imagecomparisons')
export class ImageComparison {
  @PrimaryGeneratedColumn()
  ComparisonID: number;

  @Column({ type: 'varchar', length: 255 })
  Title: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'int', nullable: true })
  YearOld: number;

  @Column({ type: 'int', nullable: true })
  YearNew: number;

  // --- Foreign keys (IDs) ---
  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @Column({ type: 'int', nullable: true })
  HistoricalImageID: number;

  @Column({ type: 'int', nullable: true })
  ModernImageID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  // --- Optional backup filepaths (kept if needed) ---
  @Column({ type: 'varchar', length: 255, nullable: true })
  OldImagePath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  NewImagePath: string;

  // --- Relations ---
  @ManyToOne(() => Articles, (article) => article.analytics, { nullable: true })
  @JoinColumn({ name: 'ArticleID' })
  article?: Articles;

  @ManyToOne(() => Categories, (cat) => cat.articles, { nullable: true })
  @JoinColumn({ name: 'CategoryID' })
  category?: Categories;

  @ManyToOne(() => Images, (img) => img.ImageID, { nullable: true })
  @JoinColumn({ name: 'HistoricalImageID' })
  historicalImage?: Images;

  @ManyToOne(() => Images, (img) => img.ImageID, { nullable: true })
  @JoinColumn({ name: 'ModernImageID' })
  modernImage?: Images;

  @ManyToOne(() => Users, (u) => u.articles, { nullable: true })
  @JoinColumn({ name: 'UserID' })
  user?: Users;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;
}
