import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Article } from './article.entity';
import { Timeline } from './timeline.entity';

@Entity('MapLocations')
export class MapLocation {
  @PrimaryGeneratedColumn()
  LocationID: number;

  @Column({ type: 'nvarchar', length: 100, nullable: false })
  Name: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: false })
  Latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: false })
  Longitude: number;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Description: string;

  @ManyToOne(() => Timeline, { nullable: true })
  TimelineID: Timeline;

  @ManyToOne(() => Article, { nullable: true })
  ArticleID: Article;
}