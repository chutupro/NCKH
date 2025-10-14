import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { Article } from '../../articles/entities/article.entity';
import { Contribution } from '../../contributions/entities/contribution.entity';
import { Feedback } from '../../feedback/entities/feedback.entity';
import { VersionHistory } from '../../articles/entities/version-history.entity';
import { PhotoAnnotation } from '../../images/entities/photo-annotation.entity';

/**
 * User entity
 */
@Entity('Users')
export class User {
  @PrimaryGeneratedColumn({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'Email', type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'PasswordHash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ name: 'FullName', type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ name: 'RoleID' })
  roleId!: number;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt!: Date;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'RoleID' })
  role!: Role;

  @OneToMany(() => Article, (article) => article.user)
  articles!: Article[];

  @OneToMany(() => Contribution, (contribution) => contribution.user)
  contributions!: Contribution[];

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks!: Feedback[];

  @OneToMany(() => VersionHistory, (version) => version.user)
  versionHistories!: VersionHistory[];

  @OneToMany(() => PhotoAnnotation, (annotation) => annotation.user)
  photoAnnotations!: PhotoAnnotation[];
}

