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
import { Feedback } from './feedback.entity';
import { LocationImage } from './location-image.entity';
import { Images } from './image.entity';

@Entity('MapLocations')
export class MapLocations {
  @PrimaryGeneratedColumn()
  LocationID: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 150, nullable: false })
  Name: string;

  @Column({ name: 'Latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  Latitude: number;

  @Column({ name: 'Longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  Longitude: number;

  @Column({ name: 'Address', type: 'nvarchar', length: 500, nullable: true })
  Address: string;

  @Column({ name: 'MainImageID', type: 'int', nullable: true })
  MainImageID: number | null;

  @Column({ name: 'OldImageID', type: 'int', nullable: true })
  OldImageID: number | null;

  @Column({ name: 'Desc', type: 'nvarchar', length: 500 })
  description: string;

  @Column({ name: 'FullDesc', type: 'nvarchar', length: 2000 })
  fullDescription: string;

  @Column({ name: 'ArticleID', type: 'int', nullable: true })
  ArticleID: number;

  @Column({ name: 'Rating', type: 'decimal', precision: 2, scale: 1, nullable: true })
  Rating: number;

  @Column({ name: 'Reviews', type: 'int', nullable: true })
  Reviews: number;

  @ManyToOne(() => Articles, (article) => article.mapLocations, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Images, { nullable: true })
  @JoinColumn({ name: 'MainImageID' })
  mainImage: Images;

  @ManyToOne(() => Images, { nullable: true })
  @JoinColumn({ name: 'OldImageID' })
  oldImage: Images;

  @OneToMany(() => Feedback, (feedback) => feedback.location)
  feedbacks: Feedback[];

  @OneToMany(() => LocationImage, (image) => image.location)
  communityImages: LocationImage[];
}