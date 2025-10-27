import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Articles } from './article.entity'; 
import { Timelines } from './timeline.entity';

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
  Description: string;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'int', nullable: true })
  TimelineID: number;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.mapLocations)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @ManyToOne(() => Timelines, (timeline) => timeline.mapLocations)
  @JoinColumn({ name: 'TimelineID' })
  timeline: Timelines;
<<<<<<< Updated upstream
}
=======

  @OneToMany(() => Feedback, (feedback) => feedback.location)
  feedbacks: Feedback[];
}
>>>>>>> Stashed changes
