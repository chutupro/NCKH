import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';
import { Timeline } from '../../timelines/entities/timeline.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { VersionHistory } from './version-history.entity';
import { Analytics } from './analytics.entity';
import { ImageComparison } from '../../images/entities/image-comparison.entity';
import { MapLocation } from '../../map-locations/entities/map-location.entity';
import { LocationEvent } from '../../map-locations/entities/location-event.entity';

/**
 * Article entity
 */
@Entity('Articles')
export class Article {
  @PrimaryGeneratedColumn({ name: 'ArticleID' })
  articleId!: number;

  @Column({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'Title', type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'Content', type: 'longtext' })
  content!: string;

  @Column({ name: 'Language', type: 'varchar', length: 10 })
  language!: string;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt!: Date;

  @Column({ name: 'UpdatedAt', type: 'datetime', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.articles)
  @JoinColumn({ name: 'UserID' })
  user!: User;

  @OneToMany(() => Image, (image) => image.article)
  images!: Image[];

  @OneToMany(() => Timeline, (timeline) => timeline.article)
  timelines!: Timeline[];

  @OneToMany(() => Contribution, (contribution) => contribution.article)
  contributions!: Contribution[];

  @OneToMany(() => Feedback, (feedback) => feedback.article)
  feedbacks!: Feedback[];

  @OneToMany(() => VersionHistory, (version) => version.article)
  versionHistories!: VersionHistory[];

  @OneToOne(() => Analytics, (analytics) => analytics.article)
  analytics!: Analytics;

  @OneToMany(() => ImageComparison, (comparison) => comparison.article)
  imageComparisons!: ImageComparison[];

  @OneToMany(() => MapLocation, (location) => location.article)
  mapLocations!: MapLocation[];

  @OneToMany(() => LocationEvent, (event) => event.article)
  locationEvents!: LocationEvent[];
}

