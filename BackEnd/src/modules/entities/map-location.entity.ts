import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
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

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Desc: string;

  @Column({ type: 'nvarchar', length: 2000, nullable: true })
  FullDesc: string;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  TimelineID: number;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;  // ← THÊM

  @Column({ type: 'decimal', precision: 2, scale: 1, nullable: true })
  Rating: number;

  @Column({ type: 'int', nullable: true })
  Reviews: number;

  @ManyToOne(() => Articles, (article) => article.mapLocations)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Timelines, (timeline) => timeline.mapLocations)
  @JoinColumn({ name: 'TimelineID' })
  timeline: Timelines;

  @ManyToOne(() => Categories, (category) => category.mapLocations)
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;  // ← THÊM

  @OneToMany(() => Feedback, (feedback) => feedback.location)
  feedbacks: Feedback[];
}
