import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MapLocations } from './map-location.entity';
import { Users } from './user.entity';

export type LocationImageStatus = 'pending' | 'approved' | 'rejected';

@Entity('LocationImages')
export class LocationImage {
  @PrimaryGeneratedColumn()
  SubmissionID: number;

  @Column({ type: 'int' })
  LocationID: number;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'varchar', length: 255 })
  ImagePath: string;

  @Column({ type: 'int', nullable: true })
  Year: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  Status: LocationImageStatus;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedAt: Date;

  @ManyToOne(() => MapLocations, (location) => location.communityImages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'LocationID' })
  location: MapLocations;

  @ManyToOne(() => Users, (user) => user.locationImages, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'UserID' })
  user?: Users;
}


