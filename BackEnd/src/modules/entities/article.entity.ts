import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './user.entity'; 
import { Categories } from './category.entity'; 
import { Analytics } from './analytics.entity'; 
import { Comments } from './comment.entity';
import { Contributions } from './contribution.entity'; 
import { Feedback } from './feedback.entity';
import { Images } from './image.entity'; 
import { MapLocations } from './map-location.entity';
import { Timelines } from './timeline.entity'; 
import { VersionHistory } from './version-history.entity'; 
import { Likes } from './like.entity'; 

@Entity('Articles')
export class Articles {
  @PrimaryGeneratedColumn()
  ArticleID: number;

  @Column({ type: 'nvarchar', length: 200, nullable: false })
  Title: string;

  @Column({ type: 'nvarchar', length: '255', nullable: true })
  Content: string;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'vi' })
  Language: string;

  @CreateDateColumn({ type: 'datetime' })
  CreatedAt: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  UpdatedAt: Date;

  @Column({ type: 'int', nullable: true })
  UserID: number;

  @Column({ type: 'int', nullable: true })
  CategoryID: number;

  // --- RELATIONS ---
  @ManyToOne(() => Users, (user) => user.articles)
  @JoinColumn({ name: 'UserID' })
  user: Users;

  @ManyToOne(() => Categories, (category) => category.articles)
  @JoinColumn({ name: 'CategoryID' })
  category: Categories;

  @OneToMany(() => Analytics, (analytics) => analytics.article)
  analytics: Analytics[];

  @OneToMany(() => Comments, (comment) => comment.article)
  comments: Comments[];

  @OneToMany(() => Contributions, (contribution) => contribution.article)
  contributions: Contributions[];

  @OneToMany(() => Feedback, (feedback) => feedback.article)
  feedbacks: Feedback[];

  @OneToMany(() => Images, (image) => image.article)
  images: Images[];

  @OneToMany(() => MapLocations, (mapLocation) => mapLocation.article)
  mapLocations: MapLocations[];

  @OneToMany(() => Timelines, (timeline) => timeline.article)
  timelines: Timelines[];

  @OneToMany(() => VersionHistory, (versionHistory) => versionHistory.article)
  versionHistory: VersionHistory[];

  @OneToMany(() => Likes, (like) => like.article)
  likes: Likes[];
}