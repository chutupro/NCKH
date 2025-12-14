import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Articles } from './article.entity';
import { Categories } from './category.entity';
import { Collections } from './collection.entity';

@Entity('Images')
export class Images {
  @PrimaryGeneratedColumn()
  ImageID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  FilePath: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  AltText: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  Type: string | null;

  @Column({ type: 'int', nullable: true })
  CategoryID: number | null;

  @Column({ type: 'int', nullable: true })
  CollectionID: number | null;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.images, { nullable: true })
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Categories, (category) => category.images, { nullable: true })
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;

  @ManyToOne(() => Collections, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'CollectionID' })
  collection: Collections;
}