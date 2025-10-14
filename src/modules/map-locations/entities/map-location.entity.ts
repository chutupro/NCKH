import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Timeline } from '../../timelines/entities/timeline.entity';
import { Article } from '../../articles/entities/article.entity';
import { LocationEvent } from './location-event.entity';

/**
 * Map location entity
 */
@Entity('MapLocations')
export class MapLocation {
  @PrimaryGeneratedColumn({ name: 'LocationID' })
  locationId!: number;

  @Column({ name: 'Name', type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'Latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude!: number;

  @Column({ name: 'Longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude!: number;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description!: string | null;

  @Column({ name: 'TimelineID', nullable: true })
  timelineId!: number | null;

  @Column({ name: 'ArticleID', nullable: true })
  articleId!: number | null;

  @ManyToOne(() => Timeline, (timeline) => timeline.mapLocations)
  @JoinColumn({ name: 'TimelineID' })
  timeline!: Timeline;

  @ManyToOne(() => Article, (article) => article.mapLocations)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;

  @OneToMany(() => LocationEvent, (event) => event.location)
  locationEvents!: LocationEvent[];
}

