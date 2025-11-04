// src/entities/timeline.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Articles } from './article.entity';
import { MapLocations } from './map-location.entity';
import { Categories } from './category.entity';

@Entity('Timelines')
export class Timelines {
  @PrimaryGeneratedColumn({ name: 'TimelineID' })
  timelineID: number;

  @Column({ type: 'nvarchar', length: 150, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  eventDate: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  category: string;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @ManyToOne(() => Categories, (cat) => cat.timelines, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'CategoryID' })
  categoryEntity: Categories;

  @ManyToOne(() => Articles, (article) => article.timelines, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @OneToMany(() => MapLocations, (map) => map.timeline, { cascade: true })
  mapLocations: MapLocations[];
}