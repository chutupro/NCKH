import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Image } from './image.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Photo annotation entity
 */
@Entity('PhotoAnnotations')
export class PhotoAnnotation {
  @PrimaryGeneratedColumn({ name: 'AnnotationID' })
  annotationId!: number;

  @Column({ name: 'ImageID' })
  imageId!: number;

  @Column({ name: 'UserID' })
  userId!: number;

  @Column({ name: 'AnnotationText', type: 'varchar', length: 1000 })
  annotationText!: string;

  @CreateDateColumn({ name: 'CreatedAt' })
  createdAt!: Date;

  @Column({ name: 'IsApproved', type: 'boolean', default: false })
  isApproved!: boolean;

  @ManyToOne(() => Image, (image) => image.photoAnnotations)
  @JoinColumn({ name: 'ImageID' })
  image!: Image;

  @ManyToOne(() => User, (user) => user.photoAnnotations)
  @JoinColumn({ name: 'UserID' })
  user!: User;
}

