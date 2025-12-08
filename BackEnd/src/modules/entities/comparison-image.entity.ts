import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ImageComparison } from './image-comparison.entity';

@Entity('comparisonimages')
export class ComparisonImage {
  @PrimaryGeneratedColumn()
  ImageID: number;

  @Column({ type: 'int' })
  ComparisonID: number;

  @Column({ type: 'varchar', length: 500 })
  ImagePath: string;

  @Column({ type: 'int', nullable: true })
  Year: number;

  @Column({ type: 'text', nullable: true })
  Caption: string;

  @Column({ type: 'int', default: 0 })
  DisplayOrder: number;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @ManyToOne(() => ImageComparison, (comp) => comp.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ComparisonID' })
  comparison?: ImageComparison;
}
