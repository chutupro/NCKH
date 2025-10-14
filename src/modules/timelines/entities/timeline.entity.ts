import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Article } from '../../articles/entities/article.entity';
import { MapLocation } from '../../map-locations/entities/map-location.entity';

/**
 * Timeline entity for historical events
 */
@Entity('Timelines')
export class Timeline {
  @PrimaryGeneratedColumn({ name: 'TimelineID' })
  timelineId!: number;

  @Column({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'EventDate', type: 'datetime' })
  eventDate!: Date;

  @Column({ name: 'Description', type: 'varchar', length: 500 })
  description!: string;

  @Column({ name: 'Latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number | null;

  @Column({ name: 'Longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number | null;

  @ManyToOne(() => Article, (article) => article.timelines)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @OneToMany(() => MapLocation, (location) => location.timeline)
  mapLocations!: MapLocation[];
}

