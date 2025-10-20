import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Articles } from './article.entity'; 
import { MapLocations } from './map-location.entity'; 

@Entity('Timelines')
export class Timelines {
  @PrimaryGeneratedColumn()
  TimelineID: number;

  @Column({ type: 'int', nullable: true })
  ArticleID: number;

  @Column({ type: 'date', nullable: true })
  EventDate: Date;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  Description: string;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  Title: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  Category: string;

  // --- RELATIONS ---
  @ManyToOne(() => Articles, (article) => article.timelines)
  @JoinColumn({ name: 'ArticleID' })
  article: Articles;

  @OneToMany(() => MapLocations, (mapLocation) => mapLocation.timeline)
  mapLocations: MapLocations[];
}