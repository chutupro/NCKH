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
// Articles relation removed for this entity
import { Categories } from './category.entity';
// Images relation removed for this entity
// Users relation removed for this entity

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
  CategoryID: number;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  Address: string;
  

  

  // --- Optional backup filepaths (kept if needed) ---
  @Column({ type: 'varchar', length: 255, nullable: true })
  OldImagePath: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  NewImagePath: string;

  // --- Relations ---
  @ManyToOne(() => Categories, (cat) => cat.articles, { nullable: true })
  @JoinColumn({ name: 'CategoryID' })
  category?: Categories;

  

  

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;
}
