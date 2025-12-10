// src/entities/timeline.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MapLocations } from './map-location.entity';
import { Images } from './image.entity';

@Entity('Timelines')
export class Timelines {
  @PrimaryGeneratedColumn({ name: 'TimelineID' })
  timelineID: number;

  @Column({ type: 'nvarchar', length: 150, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 10, nullable: false })
  eventDate: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: true })
  ImageID: number | null;

  @Column({ type: 'int', nullable: true })
  LocationID: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 20, nullable: false, default: 'pending' })
  status: string; // 'pending' | 'approved' | 'rejected'

  @ManyToOne(() => Images, { nullable: true })
  @JoinColumn({ name: 'ImageID' })
  image: Images;

  @ManyToOne(() => MapLocations, { nullable: true })
  @JoinColumn({ name: 'LocationID' })
  location: MapLocations;
}