// src/modules/entities/image-comparison.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Categories } from './category.entity';
import { ComparisonImage } from './comparison-image.entity';

@Entity('imagecomparisons')
export class ImageComparison {
  @PrimaryGeneratedColumn()
  ComparisonID: number;

  @Column({ type: 'varchar', length: 255 })
  Title: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  // --- Foreign keys (IDs) ---
  @Column({ type: 'int', nullable: true })
  CategoryID: number;
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  Address: string;

  // --- Relations ---
  @ManyToOne(() => Categories, (cat) => cat.articles, { nullable: true })
  @JoinColumn({ name: 'CategoryID' })
  category?: Categories;

  @OneToMany(() => ComparisonImage, (img) => img.comparison)
  images?: ComparisonImage[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  updatedAt: Date;
}
