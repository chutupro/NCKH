import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MapLocation } from './map-location.entity';
import { Article } from '../../articles/entities/article.entity';

/**
 * Location event entity
 */
@Entity('LocationEvents')
export class LocationEvent {
  @PrimaryGeneratedColumn({ name: 'EventID' })
  eventId!: number;

  @Column({ name: 'LocationID' })
  locationId!: number;

  @Column({ name: 'EventDate', type: 'datetime' })
  eventDate!: Date;

  @Column({ name: 'EventTitle', type: 'varchar', length: 200 })
  eventTitle!: string;

  @Column({ name: 'EventDescription', type: 'varchar', length: 1000, nullable: true })
  eventDescription!: string | null;

  @Column({ name: 'ArticleID', nullable: true })
  articleId!: number | null;

  @ManyToOne(() => MapLocation, (location) => location.locationEvents)
  @JoinColumn({ name: 'LocationID' })
  location!: MapLocation;

  @ManyToOne(() => Article, (article) => article.locationEvents)
  @JoinColumn({ name: 'ArticleID' })
  article!: Article;
}

