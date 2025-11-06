// src/entities/map-location.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Articles } from './article.entity';
import { Timelines } from './timeline.entity';
import { Feedback } from './feedback.entity';
import { Categories } from './category.entity';

@Entity('MapLocations')
export class MapLocations {
  @PrimaryGeneratedColumn()
  LocationID: number;

  @Column({ type: 'nvarchar', length: 150, nullable: false })
  Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  Latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  Longitude: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Address: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Image: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  OldImage: string;

  // ĐỔI TÊN: Desc → description
  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description: string;

  // ĐỔI TÊN: FullDesc → fullDescription
  @Column({ type: 'nvarchar', length: 2000, nullable: true })
  fullDescription: string;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  TimelineID: number;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  Rating: number;

  @Column({ type: 'int', nullable: true })
  Reviews: number;

  @ManyToOne(() => Articles, (article) => article.mapLocations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Timelines, (timeline) => timeline.mapLocations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'TimelineID' })
  timeline: Timelines;

  @ManyToOne(() => Categories, (category) => category.mapLocations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;

  @OneToMany(() => Feedback, (feedback) => feedback.location)
  feedbacks: Feedback[];
}